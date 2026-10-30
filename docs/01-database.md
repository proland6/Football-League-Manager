# Adatbázis dokumentáció

Ez a dokumentum a webalkalmazás adatbázisának kezdeti felépítését, a táblák mezőit, azok típusait, valamint a táblák közötti kapcsolatokat tartalmazza.

Az alkalmazás backendje **Django**, az adatbázis pedig **PostgreSQL** lesz.

Az adatbázis tábláit Django modellek és migrációk segítségével hozzuk létre, nem manuálisan PostgreSQL-ben.

---

# Táblák

## 1. Team

A bajnokságban szereplő csapatokat tárolja.

| Mező | Típus | Kulcs | Leírás |
|---|---|---|---|
| `id` | SERIAL | PK | A csapat egyedi azonosítója |
| `name` | VARCHAR(255) | | A csapat neve |
| `leader_id` | INTEGER | FK | A csapat vezetője → Django User |


### Kapcsolatok

- Egy csapatnak több játékosa lehet.
- Egy játékos egy csapathoz tartozik.
- Egy csapat több bajnokságban is szerepelhet.
- Egy csapat több mérkőzésen is szerepelhet.
- Egy csapatnak jelenleg egy csapatvezetője lehet.
- A `leader_id` a Django által biztosított User modellre mutató idegen kulcs.

### Csapatvezető kapcsolat

A `leader_id` mezőt Django-ban `ForeignKey` segítségével valósítjuk meg.

```python
leader = models.ForeignKey(
    User,
    on_delete=models.SET_NULL,
    null=True,
    blank=True
)
```

A `SET_NULL` miatt egy csapatvezető User törlése esetén maga a csapat nem törlődik, csak a `leader_id` értéke lesz `NULL`.

A `ForeignKey` adatbázis-szinten azt is lehetővé teszi, hogy ugyanaz a User több csapat vezetőjeként szerepeljen.

Az alkalmazás jelenlegi üzleti logikája szerint azonban:

> Egy csapatvezető csak egy csapatot vezethet.

Ezt az alkalmazáslogikában fogjuk korlátozni.

Ha később olyan követelmény lesz, hogy **egy csapatnak több csapatvezetője is lehessen**, akkor a kapcsolat `ManyToManyField` kapcsolatra módosítható Django migráció segítségével.

---

## 2. Player

A játékosok adatait tárolja.

| Mező | Típus | Kulcs | Leírás |
|---|---|---|---|
| `id` | SERIAL | PK | A játékos egyedi azonosítója |
| `first_name` | VARCHAR(255) | | Vezetéknév |
| `last_name` | VARCHAR(255) | | Keresztnév |
| `birth_date` | DATE | | Születési dátum |
| `email` | VARCHAR(255) | | E-mail cím |
| `team_id` | INTEGER | FK | A játékos csapata → Team |
| `image` | ImageField |  | A játékos képe |

### Kapcsolatok

A `Player` és `Team` között **N:1 kapcsolat** van.

Egy csapatnak több játékosa lehet:

```text
Team 1 ───────── N Player
```

Egy játékos azonban egyszerre egy csapathoz tartozik.

A `team_id` mező a `Team` tábla `id` mezőjére mutat.

### Bejelentkezés

A játékosok nem rendelkeznek felhasználói fiókkal.

Ezért a `Player` és a Django `User` között nincs kapcsolat.

A játékosoknak nem kell bejelentkezniük az alkalmazásba.

### Játékosok profilképének tárolása

A `Player` modell egy opcionális `image` mezővel rendelkezik, amely a játékos profilképének elérési útját tárolja.

A mező Django `ImageField` típussal lett létrehozva:

```python
image = models.ImageField(
    upload_to="players/",
    null=True,
    blank=True
)
```

**A mező működése:**

- `upload_to="players/"`: a feltöltött képek a `media/players/` könyvtárba kerülnek.
- `null=True`: az adatbázisban a mező értéke lehet `NULL`.
- `blank=True`: a profilkép megadása nem kötelező.

A képfájlok nem közvetlenül a PostgreSQL adatbázisban tárolódnak. Az adatbázis csak a fájl relatív elérési útját tartalmazza.

A fájlok tárolásához a Django `MEDIA_ROOT` és `MEDIA_URL` beállításait használjuk.

A képfeltöltéshez szükséges adatbázis-módosítást Django migrációval hajtottuk végre.
---

## 3. Championship

A bajnokságok adatait tárolja.

| Mező | Típus | Kulcs | Leírás |
|---|---|---|---|
| `id` | SERIAL | PK | A bajnokság egyedi azonosítója |
| `name` | VARCHAR(255) | | A bajnokság neve |
| `start_date` | DATE | | A bajnokság kezdési dátuma |
| `end_date` | DATE | | A bajnokság befejezési dátuma |
| `status` | VARCHAR(255) | | A bajnokság aktuális állapota, Django `TextChoices` használatával |

### Kapcsolatok

Egy bajnokságban több csapat szerepelhet.

Egy csapat egy szezonban csak egy bajnokságban szerepelhet, de a múltbéli bajnokságokat is eltároljuk.

Ezért a `Championship` és `Team` között **N:M kapcsolat** van:

```text
Championship N ───────── M Team
```

Egy bajnoksághoz több mérkőzés is tartozhat:

```text
Championship 1 ───────── N Match
```

### Status mező

A `status` mező csak előre meghatározott értékeket vehet fel. Az engedélyezett értékeket Django `TextChoices` segítségével definiáljuk.

- `PLANNED` -> A bajnokság létre van hozva, de még nem kezdődött el.
- `ONGOING` -> A bajnokság jelenleg zajlik.
- `FINISHED` -> A bajnokság már véget ért.


---

## 4. Championship_team

A `Championship` és `Team` közötti N:M kapcsolatot megvalósító kapcsolótábla.

| Mező | Típus | Kulcs | Leírás |
|---|---|---|---|
| `championship_id` | INTEGER | FK | Bajnokság → Championship |
| `team_id` | INTEGER | FK | Csapat → Team |

A kapcsolat:

```text
Championship
      │
      │ 1
      │
      N
Championship_team
      N
      │
      │ 1
      │
    Team
```

### Django megvalósítás

Ezt a táblát várhatóan nem hozzuk létre külön Django modellként.

A `Team` modellben `ManyToManyField` segítségével adjuk meg a kapcsolatot:

```python
championships = models.ManyToManyField(Championship)
```

Django ez alapján automatikusan létrehozza a szükséges kapcsolótáblát.

A DrawDB diagramon ettől függetlenül szerepel a `Championship_team` tábla, hogy az adatbázis N:M kapcsolata egyértelműen látható legyen.

---

## 5. Match

A bajnokság mérkőzéseinek adatait tárolja.

| Mező | Típus | Kulcs | Leírás |
|---|---|---|---|
| `id` | SERIAL | PK | A mérkőzés egyedi azonosítója |
| `championship_id` | INTEGER | FK | A mérkőzés bajnoksága → Championship |
| `home_team_id` | INTEGER | FK | Az hazai csapat → Team |
| `away_team_id` | INTEGER | FK | A vendég csapat → Team |
| `home_team_score` | INTEGER | | Az hazai csapat góljainak száma |
| `away_team_score` | INTEGER | | A vendég csapat góljainak száma |
| `referee_id` | INTEGER | FK | A mérkőzést vezető játékvezető -> Django User|
| `date` | TIMESTAMP | | A mérkőzés kezdési dátuma és időpontja |
| `status` | VARCHAR(255) | | A mérkőzés aktuális állapota, Django `TextChoices` használatával |


### Championship kapcsolat

Egy mérkőzés egy bajnoksághoz tartozik.

Egy bajnoksághoz több mérkőzés tartozhat:

```text
Championship 1 ───────── N Match
```

A `championship_id` a `Championship` tábla `id` mezőjére mutat.

### Team kapcsolatok

Egy mérkőzésen két csapat szerepel.

Ezért két külön idegen kulcs szükséges:

```text
home_team_id → Team.id
away_team_id → Team.id
```

Mindkettő ugyanarra a `Team` táblára mutat.

Egy csapat természetesen több mérkőzésen is szerepelhet.

### Referee kapcsolat

Egy mérkőzéshez egy játékvezető tartozhat,míg egy játékvezető több mérkőzést is vezethet.

A `Match` és a játékvezetőként használt `Django User` között, ezért N:1 kapcsolat van.

```text
Django User 1 ───────── N Match
```

### Mérkőzés időpontja

A `date` mező nem csak a mérkőzés dátumát, hanem annak kezdési időpontját is tárolja.

Például:

```text
2026-10-15 18:30
```

Ezért PostgreSQL-ben `TIMESTAMP`, Django-ban pedig várhatóan `DateTimeField` típust használunk.

### Status mező

A `status` mező csak előre meghatározott értékeket vehet fel. Az engedélyezett értékeket Django `TextChoices` segítségével definiáljuk.

- `SCHEDULED` -> A meccs létre van hozva, de még nem kezdődött el.
- `ONGOING` -> A meccs jelenleg zajlik.
- `FINISHED` -> A meccs már véget ért.
- `CANCELLED` -> A meccs elmaradt valami okból.

---

# Django User

## Miért nincs saját User táblánk?

A felhasználók kezelésére **nem készítünk saját `User` modellt**.

A Django rendelkezik saját beépített autentikációs rendszerrel és User modellel.

Ez kezeli többek között:

- a felhasználókat,
- a jelszavakat,
- a bejelentkezést,
- az adminisztrátorokat,
- a jogosultságokat.

Ezért nincs szükség arra, hogy ugyanezt saját táblával újra megvalósítsuk.

---

## Django User a DrawDB diagramon

A DrawDB diagramon ettől függetlenül szerepel egy `Django User` nevű tábla.

Ennek célja, hogy az adatbázisdiagramon látható legyen a Django User és a saját `Team`, `Match` tábláink közötti kapcsolatok.

A diagramon a fontosabb mezőket tüntetjük fel:

| Mező | Típus | Kulcs | Leírás |
|---|---|---|---|
| `id` | SERIAL | PK | Felhasználó azonosítója |
| `username` | VARCHAR(150) | | Felhasználónév |
| `password` | VARCHAR(128) | | Hash-elt jelszó |
| `email` | VARCHAR(254) | | E-mail cím |
| `first_name` | VARCHAR(150) | | Vezetéknév |
| `last_name` | VARCHAR(150) | | Keresztnév |

A Django tényleges User modellje ennél több mezőt tartalmaz.

Például jogosultságokhoz és adminisztrációhoz kapcsolódó mezőket is.

A DrawDB-ben nem szükséges a Django teljes belső User modelljét ábrázolni.

---

# Kik rendelkeznek User fiókkal?

Az alkalmazásban csak azoknak van szükségük User fiókra, akiknek be kell jelentkezniük.

Ezek:

- adminisztrátor,
- csapatvezetők,
- játékvezetők

A játékosoknak nincs User fiókjuk.

A látogatóknak sincs szükségük User fiókra.

A publikus adatokat bejelentkezés nélkül is meg lehet majd tekinteni.

---

# Adminisztrátor

Az adminisztrátor szintén egy Django User.

Az adminisztrátor azonban nincs hozzárendelve egyetlen csapathoz sem `leader_id` segítségével és a mérkőzésekhez sem `referee_id`-val.

Például:

```text
Django User

id = 1
username = admin
```

Az adminisztrátor a Django jogosultsági rendszerének köszönhetően kezelheti a rendszer adatait.

Tehát nem azért tud egy csapatot módosítani, mert ő annak a vezetője, hanem azért, mert megfelelő adminisztrátori jogosultságokkal rendelkezik.

Például:

```text
                    Django User
                    id = 1
                    admin
                       │
                       │ admin jogosultság
                       ▼
              ┌─────────────────┐
              │ rendszer adatai │
              └─────────────────┘
                │      │      │
                ▼      ▼      ▼
              Team   Player  Match
```

---

# Csapatvezető

A csapatvezető szintén egy Django User.

A különbség az adminisztrátorhoz képest az, hogy a csapatvezető egy `Team` rekordhoz kapcsolódik.

Például:

```text
Django User
id = 2
username = kovacs
email = kovacs@example.com

        │
        │ leader_id = 2
        ▼

Team
id = 1
name = Example FC
leader_id = 2
```

Ez azt jelenti, hogy Kovács az `Example FC` csapat vezetője.

---

# Játékvezető

A játékvezető is egy Django User.

A játékvezetőnek lehetősége lesz feljegyezni egy-egy mérkőzés eredményét, vagy ha a mérkőzés elmarad azt is beírni.

Például:
```text
Django User
id = 3
username = tothp
email = tothp@example.com

        │
        │ referee_id = 3
        ▼
Match
id = 12
.
.
.
referee_id = 3
```

---

# Django User és Team kapcsolata

A `Team.leader_id` a Django User modellre mutató `ForeignKey`.

A kapcsolat adatbázis-szinten:

```text
Django User 1 ───────── N Team
                         │
                         │ leader_id
                         │
```

Django-ban várhatóan:

```python
leader = models.ForeignKey(
    User,
    on_delete=models.SET_NULL,
    null=True,
    blank=True
)
```

A `SET_NULL` használatának oka, hogy ha egy csapatvezető felhasználói fiókja törlésre kerül, akkor maga a csapat ne törlődjön.

Ehelyett:

```text
leader_id = NULL
```

lesz.

---

## Jelenlegi üzleti szabály

Az alkalmazás jelenlegi működése szerint:

> Egy csapatnak egy csapatvezetője lehet.

és:

> Egy csapatvezető csak egy csapatot vezethet.

A `ForeignKey` adatbázis-szinten ugyanakkor lehetővé tenné, hogy ugyanaz a Django User több `Team` rekord `leader_id` mezőjében is szerepeljen.

Ezt jelenleg az alkalmazás üzleti logikájában fogjuk korlátozni.

---

## Több csapatvezető később

A `ForeignKey` használata mellett egy `Team` rekordban jelenleg egyetlen `leader_id` szerepelhet.

Ha később olyan követelmény lesz, hogy:

> Egy csapatnak több csapatvezetője is lehessen.

akkor a jelenlegi kapcsolatot át kell alakítani.

Jelenleg:

```text
Team
│
└── leader_id → Django User
```

Később:

```text
Team N ───────── N Django User
```

Django-ban ehhez például `ManyToManyField` használható:

```python
leaders = models.ManyToManyField(User)
```

Django ekkor egy kapcsolótáblával valósítja meg a kapcsolatot.

A módosítás később Django migráció segítségével vezethető át az adatbázisba.

Ezért jelenleg nem bonyolítjuk túl az adatmodellt, hanem marad az egyetlen `leader_id`.

---

# Jogosultságok

Nem készítünk külön `Role` táblát.

A jogosultságokat a Django beépített autentikációs és jogosultságkezelő rendszerére építjük.

A rendszerben alapvetően három bejelentkezett felhasználói típus lesz:

```text
Django User
     │
     ├── Adminisztrátor
     │
     └── Csapatvezető
     │
     └── Játékvezető
```

Az adminisztrátor szélesebb jogosultságokkal rendelkezik.

A csapatvezető csak a számára engedélyezett műveleteket végezheti el, elsősorban a saját csapatával kapcsolatban.

A játékvezető csak a számára engedélyezett műveleteket végezheti el, elsősorban a mérkőzésekkel kapcsolatban.

A `Role` tábla ezért nem szükséges a saját adatmodellünkben.

---

# Google bejelentkezés

A csapatvezetők és játékvezetők számára Google-bejelentkezést szeretnénk biztosítani.

Ehhez várhatóan a `django-allauth` csomagot fogjuk használni.

A folyamat:

```text
Google-fiók
      │
      ▼
Google OAuth
      │
      ▼
django-allauth
      │
      ▼
Django User
      │
      ▼
Team.leader_id/Match.referee_id
```

A Google-fiók tehát **nem közvetlenül a Team /Match táblához kapcsolódik**.

A Google feladata a felhasználó személyazonosságának hitelesítése.

Az alkalmazáson belül továbbra is a Django User reprezentálja a bejelentkezett felhasználót.

---

## Google-adatok tárolása

Nem készítünk például ilyen mezőt a saját Django User táblánkhoz:

```text
google_id
```

A Google-integrációhoz szükséges adatokat a `django-allauth` saját modelljei és adatbázistáblái kezelik.

---

## Ki jelentkezhet be Google-lel?

Nem szeretnénk, hogy tetszőleges Google-fiókkal bárki csapatvezetőként vagy játékvezetőként hozzáférhessen az alkalmazáshoz.

A tervezett működés:

```text
Google bejelentkezés
        │
        ▼
Google azonosítja a felhasználót
        │
        ▼
Django / django-allauth
        │
        ▼
Engedélyezett felhasználó?
        │
      ┌─┴─┐
      │   │
     Igen Nem
      │   │
      ▼   ▼
  belépés hozzáférés
          megtagadva
```

Csak az előzetesen engedélyezett felhasználók kaphatnak megfelelő hozzáférést az alkalmazáshoz.

---

# Django migrációk

Az adatbázis tábláit nem manuálisan PostgreSQL-ben hozzuk létre.

Először elkészítjük a Django modelleket a `models.py` fájlban.

A folyamat:

```text
Django models.py
        │
        ▼
python manage.py makemigrations
        │
        ▼
Django migration fájl
        │
        ▼
python manage.py migrate
        │
        ▼
PostgreSQL adatbázis
```

---

## Adatbázis későbbi módosítása

Ha később módosítani szeretnénk egy táblát, nem szükséges az egész adatbázist újra létrehozni.

Például ha a `Team` modellhez később hozzáadunk egy új mezőt:

```python
description = models.TextField(blank=True)
```

akkor új migráció készíthető:

```bash
python manage.py makemigrations
```

majd alkalmazható:

```bash
python manage.py migrate
```

Django ez alapján módosítja a PostgreSQL adatbázis szerkezetét.

A migrációk segítségével az adatbázis változásai verziózottan és követhetően kezelhetők.

---

# Kapcsolatok összefoglalása

## Django User és Team

```text
Django User 1 ───────── N Team
```

A `Team.leader_id` a Django User modellre mutat.

Jelenlegi üzleti szabály szerint egy csapatvezető csak egy csapatot vezet.

---

## Team és Player

```text
Team 1 ───────── N Player
```

Egy csapatnak több játékosa lehet.

Egy játékos egy csapathoz tartozik.

---

## Championship és Team

```text
Championship N ───────── N Team
```

N:M kapcsolat.

A kapcsolatot a `Championship_team` kapcsolótábla valósítja meg.

---

## Championship és Match

```text
Championship 1 ───────── N Match
```

Egy bajnoksághoz több mérkőzés tartozhat.

Egy mérkőzés egy bajnoksághoz tartozik.

---

## Team és Match

A `Match` két külön ForeignKey segítségével kapcsolódik a `Team` táblához:

```text
Match.home_team_id → Team.id
Match.away_team_id → Team.id
```

Egy csapat több mérkőzésen is szerepelhet.

## Django User és Match

```text
Django User 1 ───────── N Match
```

A Match.referee_id a Django User modellre mutat.

Egy mérkőzéshez egy játékvezető tartozhat,míg egy játékvezető több mérkőzést is vezethet.




---

# Adatmodell összefoglaló

A saját üzleti adatmodell fő elemei:

```text
Django User 1 ───────── N Team
     │
     │ 1
     │
     N
   Match

Team 1 ───────── N Player

Team N ───────── N Championship

Championship 1 ───────── N Match

Team 1 ───────── N Match
                 (home_team_id / away_team_id)
```

A `Django User` két külön szerepben is kapcsolódik az adatmodellhez:

- A `Team.leader_id` segítségével csapatvezetőként kapcsolódhat egy csapathoz.
- A `Match.referee_id` segítségével játékvezetőként kapcsolódhat mérkőzésekhez.

Egy játékvezető több mérkőzést is vezethet, míg egy mérkőzéshez
egy játékvezető rendelhető.

A `Championship` és `Team` között N:M kapcsolat van, amely lehetővé
teszi, hogy a korábbi bajnokságok csapatösszetétele is megmaradjon.

A `Match` ezen felül a `home_team_id` és `away_team_id` ForeignKey mezők
segítségével kétszer is kapcsolódik a `Team` táblához.

---

# Fontos tervezési döntések

1. **PostgreSQL** adatbázist használunk.
2. Az adatbázis szerkezetét **Django modellekből és migrációkkal** hozzuk létre.
3. Nem készítünk saját `User` modellt, hanem a **Django User** modellt használjuk.
4. Nem készítünk külön `Role` táblát.
5. Csak az **adminisztrátorok, csapatvezetők és játékvezetők** jelentkeznek be.
6. A játékosoknak nincs felhasználói fiókjuk.
7. A látogatók bejelentkezés nélkül érhetik el a publikus funkciókat.
8. A `Team.leader_id` egy `ForeignKey` a Django User modellre.
9. Jelenleg egy csapatnak egy vezetője van.
10. Jelenleg egy csapatvezető egy csapatot vezethet.
11. Ha később egy csapatnak több vezetője lehet, a kapcsolat `ManyToManyField`-re módosítható.
12. A Google-bejelentkezést várhatóan `django-allauth` segítségével valósítjuk meg.
13. A Google-fiók a Django Userhez kapcsolódik, nem közvetlenül a Teamhez.
14. A Google-integráció saját tábláit nem szükséges a DrawDB adatmodellben külön megtervezni.
15. A `Championship` és `Team` közötti N:M kapcsolatot Django `ManyToManyField` segítségével kezeljük.
16. A `Match.date` dátumot és időpontot is tartalmaz, ezért `TIMESTAMP` / Django `DateTimeField` lesz.
17. A `Match.referee_id` egy `ForeignKey` a Django User modellre. Egy
játékvezető több mérkőzést vezethet, míg egy mérkőzéshez egy játékvezető rendelhető.