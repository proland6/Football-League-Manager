# Football League Manager – Backend dokumentáció

## 1. A dokumentáció célja

Ez a dokumentum a Football League Manager webalkalmazás backendjének felépítését, az eddig elkészült funkciókat, a fontosabb fejlesztési döntéseket és a működés ellenőrzésének módját foglalja össze.

A modellek, mezők, adatbáziskapcsolatok és migrációk részletes leírása a külön **`DATABASE.md`** dokumentumban található; ezeket itt nem ismételjük meg. Itt elsősorban arra koncentrálunk, hogyan használja a Django alkalmazás ezeket az adatokat, hogyan teszi elérhetővé a REST API-n keresztül, és hogyan szabályozza a hozzáférést.

> **Megjegyzés:** A dokumentum a közösen megvalósított és megbeszélt részekre épül. Ahol a pontos jelenlegi forráskód (például egy URL vagy permission osztály neve) nem áll rendelkezésre, ott nem állítunk be nem ellenőrzött részleteket kész tényként.

---

## 2. Felhasznált technológiák

| Technológia | Feladat |
|---|---|
| Python 3.12 | A backend programozási nyelve a fejlesztőkörnyezetben |
| Django | Webalkalmazás-keretrendszer, modellek, adminfelület, felhasználók |
| Django REST Framework (DRF) | REST API, serializáció, API-nézetek és jogosultságok |
| PostgreSQL | Relációs adatbázis |
| Django migrations | Az adatbázis-séma létrehozása és módosítása |
| Google Identity / Google tokenellenőrzés | Google-fiókkal történő hitelesítés |
| JWT-alapú API-hitelesítés | A bejelentkezett kliens további kéréseinek hitelesítése |
| React + Vite | A frontend fejlesztői környezete; nem a Django backend része |

A Python-függőségek elkülönítésére virtuális környezet (`.venv`) szolgál.

---

## 3. A backend logikai felépítése

```text
React frontend (Vite)
         |
         | HTTP-kérések, JSON
         v
Django URL routing
         |
         v
Django REST Framework views
         |
         +---- Authentication / Permissions
         |
         v
Serializers
         |
         v
Django ORM / Models
         |
         v
PostgreSQL
```

A frontend nem közvetlenül az adatbázishoz csatlakozik. A kliens a backend API-végpontjait hívja, a backend pedig ellenőrzi a kérést, végrehajtja a szükséges adatbázis-műveletet és választ küld.

### 3.1. Fontos fájlok

```text
projekt/
├── manage.py
├── league/
│   ├── models.py
│   ├── admin.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py          # ha külön alkalmazásszintű URL-fájl van
│   ├── permissions.py   # ha külön fájlban vannak a jogosultságok
│   └── migrations/
└── projektkonfiguráció/
    ├── settings.py
    └── urls.py
```

A fenti ábra logikai szerkezetet mutat; a projektkonfiguráció tényleges könyvtárnevét és az opcionális fájlokat a repository alapján kell ellenőrizni.

- `models.py`: az adatbázis üzleti modelljei.
- `admin.py`: a Django adminfelület beállításai.
- `serializers.py`: modellobjektumok és API-adatok átalakítása.
- `views.py`: API-kérések feldolgozása, beleértve a Google-bejelentkezést.
- `urls.py`: az URL-ek és nézetek összekapcsolása.
- `settings.py`: alkalmazások, adatbázis, DRF és autentikáció konfigurációja.

---

## 4. Django adminfelület

A modellek regisztrálva vannak a Django adminfelületén. A fejlesztés során testreszabtuk a listanézeteket a könnyebb áttekinthetőség érdekében.

Az alkalmazott lehetőségek:

- `list_display`: mely oszlopok jelennek meg a listában.
- `list_display_links`: mely oszlopokra kattintva nyitható meg a rekord.
- `search_fields`: kereshető mezők.
- `list_filter`: szűrési lehetőségek.
- `ordering`: alapértelmezett rendezés.
- `@admin.display`: számított vagy formázott oszlop megjelenítése.

### 4.1. ManyToMany kapcsolat megjelenítése

A `Team.championships` mező `ManyToManyField`, ezért közvetlenül nem tehető a `list_display` elemei közé. Helyette külön metódussal jeleníthetők meg a bajnokságnevek:

```python
@admin.display(description="Championships")
def get_championships(self, obj):
    championships_name = []

    for championship in obj.championships.all():
        championships_name.append(championship.name)

    return ", ".join(championships_name)
```

A metódus egyetlen szöveggé alakítja a csapathoz kapcsolódó bajnokságok neveit. Így a csapat egy sorban marad, a bajnokságai pedig ugyanabban az oszlopban olvashatók.

---

## 5. Django REST Framework

A DRF a Django modellek adatait HTTP API-n keresztül teszi elérhetővé. A frontend JSON-formátumú adatokat küldhet és fogadhat.

A DRF beállításai a `settings.py` fájlban, a `REST_FRAMEWORK` konfigurációban találhatók. Itt adhatók meg például az alapértelmezett autentikációs és jogosultsági osztályok.

### 5.1. Serializerek

A négy modellhez `ModelSerializer` készült:

```python
from rest_framework import serializers
from .models import Championship, Team, Player, Match

class ChampionshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Championship
        fields = "__all__"

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = "__all__"
 
class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = "__all__"

    def get_fields(self):
        fields = super().get_fields()

        request = self.context.get("request")
            
        if (
            request
            and request.user.is_authenticated
            and request.user.groups.filter(name="Team Leader").exists()
        ):

            fields["team"].read_only = True 

        return fields

    def create(self, validated_data):
        request = self.context.get("request")

        if(
            request
            and request.user.is_authenticated
            and request.user.groups.filter(name="Team Leader").exists()
        ):
            team = Team.objects.get(leader = request.user)
            validated_data["team"] = team

        return super().create(validated_data)
        


class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = "__all__"

    def get_fields(self):
        fields = super().get_fields()

        request = self.context.get("request")

        if (
            request
            and request.user.is_authenticated
            and request.user.groups.filter(name="Referee").exists()
        ):
            editable_fields = {
                "id",
                "home_score",
                "away_score",
                "status",
            }

            
            for field_name, field in fields.items():
                if field_name not in editable_fields:
                    field.read_only = True
        

        return fields


```

A `ModelSerializer` a Django-modell alapján automatikusan hozza létre a serializer mezőit és több alapvető validációt. A `fields = "__all__"` minden modellmezőt bevon; ez **nem** jelenti azt, hogy minden felhasználó mindent módosíthat. A tényleges hozzáférést a nézetek és a jogosultságok szabályozzák.

### 5.2. Serializáció folyamata

```text
Adatbázis rekord
      |
      v
Django modellpéldány
      |
      v
Serializer
      |
      v
JSON-válasz
```

Létrehozásnál és módosításnál a folyamat fordított: a beérkező adatot a serializer validálja, majd a nézet a megfelelő adatbázis-műveletet végzi el.

---

## 6. REST API és CRUD

A négy üzleti modellhez API-műveleteket készítettünk és teszteltünk. A pontos URL-útvonalakat az aktuális `urls.py` alapján kell rögzíteni; a következő táblázat a HTTP-műveleteket foglalja össze.

| Metódus | Funkció | Tipikus válasz |
|---|---|---|
| `GET` | Rekordok listázása vagy egy rekord lekérése | `200 OK` |
| `POST` | Új rekord létrehozása | `201 Created` |
| `PUT` | Rekord teljes frissítése | `200 OK` |
| `PATCH` | Rekord részleges frissítése | `200 OK` |
| `DELETE` | Rekord törlése | `204 No Content` |

A válaszkódok a sikeres műveletek tipikus eseteit mutatják; hiba esetén eltérő státuszkód érkezhet.

### 6.1. PUT és PATCH különbsége

- `PUT`: jellemzően a rekord teljes reprezentációját várja.
- `PATCH`: elegendő csak a megváltoztatni kívánt mezőket elküldeni.

A DRF böngészhető API-jában előfordulhat, hogy a HTML-űrlap csak a `PUT` műveletet mutatja, miközben a `PATCH` a nyers adatos (Raw data) felületen használható.

### 6.2. Hibás kérések

| Státuszkód | Jelentés |
|---|---|
| `400 Bad Request` | Hibás vagy érvénytelen bemeneti adat |
| `401 Unauthorized` | Hiányzó vagy érvénytelen hitelesítés |
| `403 Forbidden` | A hitelesített felhasználónak nincs megfelelő jogosultsága |
| `404 Not Found` | Nem található a kért erőforrás |

A konkrét hibaválasz az autentikációs beállításoktól és az adott nézettől függ.

---

## 7. Felhasználók és jogosultságkezelés

A rendszer a Django beépített `User` modelljét és jogosultsági mechanizmusait használja. A DRF ezen felül lehetővé teszi, hogy az egyes API-kérésekhez külön hozzáférési szabályokat rendeljünk.

### 7.1. Szerepkörök

| Szerepkör | Rendeltetés |
|---|---|
| Látogató | Publikus adatok megtekintése |
| Adminisztrátor | A rendszer adatainak kezelése |
| Csapatvezető | A saját csapatához kötődő, engedélyezett műveletek |
| Játékvezető | A hozzá rendelt mérkőzésekhez kapcsolódó, engedélyezett műveletek |

### 7.2. Jogosultsági ellenőrzés

A DRF-ben a jogosultságok több szinten vizsgálhatók:

- Általános hozzáférés: a felhasználó végezheti-e az adott típusú kérést.
- Objektumszintű hozzáférés: az adott rekordhoz van-e joga.

Például nem elegendő, hogy valaki csapatvezető: a saját csapatára vonatkozó korlátozásokat is érvényesíteni kell. A jogosultságkezelés során külön foglalkoztunk a `GET`, `POST`, `PUT`, `PATCH` és `DELETE` műveletek kezelésével, valamint a csapatvezetői és játékvezetői hozzáféréssel.

A csapatvezetői módosítási lehetőségeket tudatosan szűkítettük; nem cél, hogy a csapatvezető tetszőlegesen átírhassa a csapat és a játékosok minden adatát. A pontos, jelenleg érvényes műveleti mátrixot a végleges permission osztályok forráskódja alapján kell beilleszteni.

### 7.3. Fontos biztonsági alapelv

A frontend felületén elrejtett szerkesztőgomb **nem jogosultságkezelés**. A backendnek minden védett kérésnél önállóan ellenőriznie kell a hozzáférést.

---

## 8. Google-bejelentkezés

A Google-bejelentkezést már megvalósítottuk és kipróbáltuk. Az adatbázis-tervben eredetileg `django-allauth` szerepelt lehetséges megoldásként, de a tényleges megvalósítás Google ID token ellenőrzésén alapuló saját API-nézetet használ.

### 8.1. A bejelentkezés menete

```text
Felhasználó
    |
    v
Google bejelentkezés a frontendben
    |
    v
Google ID token
    |
    v
POST /api/google-login/
    |
    v
GoogleLoginView
    |
    +--> Google token ellenőrzése
    |
    +--> Django User azonosítása
    |
    +--> Hozzáférés ellenőrzése
    |
    v
API-hitelesítéshez szükséges válasz
```

A Google a felhasználó személyazonosságát igazolja, míg az alkalmazáson belüli jogosultságokat továbbra is a Django határozza meg.

### 8.2. Google token ellenőrzése

A megvalósítás a Google Python-könyvtárának tokenellenőrző komponenseit használja. A Google transporthoz a `requests` csomagra is szükség van:

```bash
pip install requests
```

A token ellenőrzésekor többek között annak érvényességét és a megfelelő Google OAuth kliensazonosítóhoz tartozását kell vizsgálni.

### 8.3. API-végpont

A közösen létrehozott végpont:

```text
/api/google-login/
```

A Django URL-konfigurációban az osztályalapú nézetet `.as_view()` hívással kell regisztrálni. Ennek hiánya URL-konfigurációs hibát okozhat.

Példa:

```python
path("api/google-login/", GoogleLoginView.as_view(), name="google-login")
```

Ez a példa az URL-regisztráció lényegét mutatja; a pontos importhely az aktuális projektstruktúrától függ.

### 8.4. Sikertelen hitelesítés

A bejelentkezés tesztelésekor ellenőriztük a `401 Unauthorized` választ is. Ez fontos, mert a hibás vagy nem elfogadott hitelesítési adatot a backendnek el kell utasítania.

### 8.5. JWT és későbbi API-kérések

A projektben JWT-alapú autentikációval is foglalkoztunk. A Google ID token és az alkalmazás API-hozzáférésére szolgáló JWT fogalmát külön kell kezelni:

- A **Google ID token** a Google által hitelesített felhasználó azonosítására szolgál.
- Az **alkalmazás JWT-je** a további, védett API-kérések hitelesítésére használható.

A pontos tokenkibocsátási, megújítási és tárolási részleteket a jelenlegi `GoogleLoginView` és DRF-konfiguráció alapján kell ellenőrizni.

---

## 9. Frontend és backend kapcsolata

A frontendhez Vite-alapú fejlesztőkörnyezetet állítottunk be, amely hiba nélkül elindult. A Vite a frontend fejlesztését és kiszolgálását segíti; a backend továbbra is a Django alkalmazás.

```text
React / Vite                 Django / DRF
    |                             |
    | ----- HTTP request -------> |
    |                             | -- ORM --> PostgreSQL
    | <---- JSON response ------- |
    |                             |
```

A frontend-integrációnál ellenőrizendő kérdések:

- Az API alap URL-je fejlesztői és éles környezetben.
- CORS-beállítások, ha a frontend és a backend külön originről fut.
- A hitelesítési adatok biztonságos továbbítása.
- A `401` és `403` válaszok megfelelő kezelése.
- Az API-válaszok és űrlapvalidációs hibák megjelenítése.

Ezeket nem tekintjük automatikusan befejezettnek pusztán attól, hogy a Vite fejlesztői szervere elindult.

---

## 10. Tesztelés

A fejlesztés során az alábbi részeket ellenőriztük:

| Terület | Eddigi eredmény |
|---|---|
| Django modellek | Létrehozva és migrálva |
| PostgreSQL | A táblák és tesztadatok ellenőrizve |
| Django admin | Testreszabott listák és kapcsolatok kipróbálva |
| Serializerek | A négy serializer működését ellenőriztük |
| CRUD API | A fő műveleteket végigpróbáltuk |
| Jogosultságok | A kialakított szabályokat teszteltük |
| Google login | A végpont működik, hibás hitelesítésnél `401` választ is vizsgáltunk |
| Vite | A fejlesztői környezet hiba nélkül indult |

A kézi ellenőrzések fontosak, de nem helyettesítik az automatizált teszteket. Később érdemes API-teszteket írni például a különböző szerepkörök engedélyezett és tiltott műveleteire.

---

## 11. Gyakori fejlesztési hibák és tanulságok

### 11.1. Hiányzó `requests` csomag

Hiba:

```text
ImportError: The requests library is not installed
```

Megoldás: a megfelelő virtuális környezetben telepíteni kell a `requests` csomagot.

### 11.2. Osztályalapú nézet hibás URL-regisztrációja

A `GoogleLoginView` osztályt az URL-konfigurációban nem közvetlen példányként, hanem `.as_view()` segítségével kell használni.

### 11.3. `ManyToManyField` a Django admin `list_display` mezőjében

A többértékű kapcsolatot külön megjelenítő metódussal lehet olvasható szöveggé alakítani.

### 11.4. Rekordmódosítás és jogosultság

Attól, hogy egy rekord az API-n keresztül elérhető, még nem szabad mindenkinek módosítania vagy törölnie. A szerveroldali jogosultsági ellenőrzés elengedhetetlen.

---

## 12. Fontos megvalósítási döntések

1. A backend Django-ra és Django REST Frameworkre épül.
2. A Django adminfelületet az adatok átláthatósága érdekében testreszabtuk.
3. A négy modellhez `ModelSerializer` készült.
4. Az API CRUD-műveleteit teszteltük.
5. A hozzáférési szabályokat backendoldalon ellenőrizzük.
6. A csapatvezető nem kap korlátlan módosítási jogot.
7. A Google-bejelentkezés saját API-végponttal és Google-tokenellenőrzéssel működik, nem a korábban tervezett `django-allauth` megoldásként.
8. A frontend és a backend HTTP/JSON kommunikáción keresztül kapcsolódik.

---

## 13. A dokumentáció véglegesítéséhez ellenőrizendő részletek

A teljes, kódszinten pontos dokumentációhoz az alábbi fájlokból érdemes még kiemelni az aktuális állapotot:

| Forrás | Ellenőrizendő információ |
|---|---|
| `admin.py` | Az összes `ModelAdmin` végleges beállítása |
| `views.py` | ViewSetek / APIView-k, Google-bejelentkezés tényleges folyamata |
| `urls.py` fájlok | Az összes pontos API-végpont |
| Jogosultsági osztályok | Szerepkörönként és metódusonként a végleges hozzáférési mátrix |
| `settings.py` | DRF autentikáció, JWT, CORS és adatbázis-konfiguráció |
| `requirements.txt` vagy projektfüggőségek | A telepített csomagok és verzióik |

**Összegzés:** A backend adminfelülete, serializációja, CRUD API-ja, jogosultságkezelése és Google-bejelentkezési végpontja elkészült és a fejlesztés során tesztelve lett. A frontenddel történő teljes integráció és a forráskóddal egyeztetett végleges API-specifikáció külön ellenőrzést igényel.
