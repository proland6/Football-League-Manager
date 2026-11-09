# Frontend dokumentáció

## 1. A frontend bemutatása

A projekt frontend része egy React-alapú webalkalmazás, amely a
sportcsapatokkal, játékosokkal és bajnokságokkal kapcsolatos funkciók
felhasználói felületét biztosítja.

A frontend feladata, hogy a felhasználók számára áttekinthető és könnyen
kezelhető felületet nyújtson, megjelenítse a backendből érkező adatokat,
valamint lehetővé tegye az alkalmazás funkcióinak használatát.

Az eddigi fejlesztések alapján a felület főbb funkcionális területei:

-   felhasználói bejelentkezés;
-   Google-fiókkal történő bejelentkezés;
-   csapatok listázása és részletes adatainak megtekintése;
-   csapatokhoz tartozó játékosok megjelenítése;
-   bajnokságok adatainak lekérdezése és megjelenítése;
-   csapatok szűrése;
-   adminisztrátori felület;
-   csapatvezetői felület.

A frontend a backenddel HTTP-alapú API-kéréseken keresztül kommunikál.
Az adatok lekérdezését és a felhasználói műveletek kiszolgálását külön
szolgáltatásmodulok végzik.

> **Megjegyzés:** A dokumentáció az eddigi beszélgetésekben megismert
> kódrészletek és funkciók alapján készült. A pontos útvonalak, minden
> oldal, valamint az összes API-végpont felsorolásához a teljes
> projektstruktúra és a forrásfájlok ellenőrzése szükséges.

## 2. Felhasznált technológiák

### 2.1. React

A felhasználói felület React segítségével készül. A React lehetővé
teszi, hogy az alkalmazás kisebb, újrafelhasználható komponensekből
épüljön fel.

A komponensek saját állapottal rendelkezhetnek, és a kapott adatok
alapján jelenítik meg a felületet. Az eddig megismert kódban többek
között az alábbi React Hookok szerepelnek:

-   `useState`: a komponensek lokális állapotának kezelésére szolgál.
    Például az űrlapmezők értéke, a betöltési állapot vagy a hibaüzenet
    tárolható vele.
-   `useEffect`: mellékhatások kezelésére használható, például adatok
    lekérdezésére a komponens megjelenésekor.
-   `useParams`: a React Router által kezelt dinamikus
    útvonalparaméterek elérését biztosítja.

### 2.2. Vite

A Vite biztosítja a frontend fejlesztői környezetét és buildfolyamatát.
Fejlesztés közben elindítja a helyi fejlesztői szervert, a projekt
elkészítésekor pedig előállítja a telepíthető buildet.

### 2.3. React Router

Az oldalak közötti navigációt a React Router végzi. A projekt belépési
pontjában a `BrowserRouter` veszi körül az alkalmazást, így a
komponensek használhatják az útvonalkezelés funkcióit.

A dinamikus útvonalakból származó azonosítók a `useParams` Hook
segítségével olvashatók ki. Ez például egy adott csapat részletes
oldalának megjelenítésekor hasznos.

### 2.4. Axios

A backend API-val történő kommunikációhoz az Axios könyvtár használatos.
A szolgáltatásmodulok HTTP-kéréseket küldenek a backend felé, majd a
válaszokból származó adatokat továbbadják az oldalaknak és
komponenseknek.

### 2.5. Google OAuth

Az alkalmazás Google-fiókkal történő bejelentkezést is támogat. Ehhez a
`@react-oauth/google` csomag kerül felhasználásra.

A Google-bejelentkezés a hagyományos e-mail-cím és jelszó alapú
bejelentkezés mellett biztosít alternatív hitelesítési lehetőséget. A
teljes hitelesítési folyamat a frontend és a backend együttműködésével
valósul meg.

### 2.6. CSS

A felület megjelenését külön CSS-fájlok szabályozzák. A stíluslapok a
projektben funkcionális területek szerint vannak elkülönítve, így
például a bejelentkezési felülethez tartozó stílusok külön fájlokban
kezelhetők.

## 3. A projekt könyvtárszerkezete

Az eddig megismert fájlok alapján a frontend főbb részei a következők:

``` text
src/
├── components/
│   ├── team_components/
│   │   ├── Team_details
│   │   └── Team_players
│   └── ...
├── pages/
│   └── ...
├── services/
│   ├── TeamsService
│   ├── PlayersService
│   └── ...
├── styles/
│   ├── Login_style/
│   │   └── ...
│   └── ...
├── App.jsx
├── main.jsx
└── ...
```

A fenti struktúra szemléltető jellegű: csak az eddig megismert
könyvtárakat és fájlokat tartalmazza. A `...` jelölés további, itt fel
nem sorolt elemeket jelent.

### 3.1. Components

A `components` könyvtár az újrafelhasználható felületi elemeket
tartalmazza. A komponensek kisebb, jól elkülöníthető feladatokat látnak
el.

A csapatokhoz kapcsolódó komponensek például a `team_components`
alkönyvtárban találhatók:

-   `Team_details`: egy kiválasztott csapat részletes adatainak
    megjelenítéséért felel;
-   `Team_players`: a csapathoz tartozó játékosok megjelenítését végzi.

A komponensek különválasztása átláthatóbbá teszi a kódot, és lehetővé
teszi az egyes felületi elemek önálló fejlesztését.

### 3.2. Pages

A `pages` könyvtár az alkalmazás teljes oldalait tartalmazza. Egy oldal
jellemzően több kisebb komponensből épül fel, és összefogja az adott
funkcióhoz szükséges adatlekérdezéseket, állapotokat és felületi
elemeket.

Például egy csapat részletes oldala lekérheti a csapat adatait, majd
megjelenítheti a csapat részleteit és a hozzá tartozó játékosokat.

### 3.3. Services

A `services` könyvtár felel a backend API-val való kommunikációért. Az
egyes szolgáltatásfájlok egy-egy funkcionális területhez kapcsolódó
kéréseket fogják össze.

Az eddig megismert szolgáltatások:

-   `TeamsService`: a csapatokhoz kapcsolódó adatok lekérdezése, például
    a `getTeamById` és a `getChampionships` függvények;
-   `PlayersService`: a játékosok adatainak lekérdezése, például a
    `getPlayersByTeam` függvény segítségével.

A szolgáltatások elkülönítése miatt az API-hívások nem közvetlenül a
megjelenítő komponensekbe kerülnek. Ez egyszerűsíti a komponensek
felépítését és megkönnyíti a későbbi módosításokat.

### 3.4. Styles

A `styles` könyvtár a felület megjelenítéséhez szükséges CSS-fájlokat
tartalmazza. A stílusok funkcionális egységek szerint csoportosíthatók.

A bejelentkezési felülethez például külön stílusfájlok tartoznak. Ez
lehetővé teszi, hogy az egyes felületek megjelenése egymástól
függetlenül módosítható legyen.

## 4. Az alkalmazás indítása és belépési pontja

A React alkalmazás belépési pontja a `main.jsx` fájl. Ebben történik a
React gyökérelem létrehozása, a fő alkalmazáskomponens betöltése,
valamint a böngészőalapú útvonalkezelés inicializálása.

Az eddig megismert belépési pont szerkezete:

``` jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./styles/index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>
);
```

A `StrictMode` fejlesztés közben további ellenőrzéseket tesz lehetővé. A
`BrowserRouter` biztosítja az útvonalkezelési környezetet, az `App`
komponens pedig az alkalmazás fő felületét jeleníti meg.

### 4.1. Indítás fejlesztői környezetben

A frontend elindításának általános lépései:

1.  A frontend projektkönyvtár megnyitása terminálban.
2.  A függőségek telepítése az `npm install` paranccsal.
3.  A fejlesztői szerver elindítása az `npm run dev` paranccsal.
4.  Az alkalmazás megnyitása a terminálban megjelenő helyi címen.

A pontos parancsokat a projekt `package.json` fájljában található
scriptek határozzák meg.

## 5. Főbb funkcionális területek

### 5.1. Bejelentkezési felület

A bejelentkezési felület feladata, hogy a felhasználók hozzáférhessenek
az alkalmazás számukra engedélyezett funkcióihoz.

A hagyományos bejelentkezés során a felhasználó megadja az e-mail-címét
és a jelszavát. Az űrlap a React `useState` Hook segítségével tárolja a
mezők értékét.

A bejelentkezési folyamat során az alábbi állapotok kezelése szükséges:

-   az e-mail-cím értéke;
-   a jelszó értéke;
-   a betöltési állapot;
-   az esetleges hibaüzenet.

A bejelentkezési adatok elküldése a backend megfelelő végpontjára
történik. Sikeres hitelesítés esetén a frontend feldolgozza a backend
válaszát, és a rendszerben kialakított hitelesítési folyamat szerint
folytatja a felhasználó kezelését.

### 5.2. Google-fiókkal történő bejelentkezés

A hagyományos bejelentkezés mellett Google OAuth-alapú hitelesítés is
elérhető.

A Google bejelentkezési folyamatban a felhasználó a Google által
biztosított felületen hitelesíti magát. A frontend megkapja a
hitelesítési folyamat eredményét, majd azt továbbítja a backend számára
feldolgozásra.

A backend ellenőrzi a kapott adatokat, és a projekt hitelesítési
rendszerének megfelelő választ küld vissza.

A Google-bejelentkezéshez szükséges konfigurációt a Google OAuth
beállításai és a frontendben használt kliensazonosító biztosítja.

### 5.3. Csapatok megjelenítése

A csapatokhoz kapcsolódó funkciók lehetővé teszik a rendszerben szereplő
csapatok adatainak megtekintését.

A csapatok adatait a frontend a `TeamsService` szolgáltatáson keresztül
kéri le a backendtől.

Egy kiválasztott csapat részletes adatainak lekérdezésére a
`getTeamById` függvény használható. A csapat azonosítója dinamikus
útvonalparaméterként érkezhet, amelyet az oldal a `useParams` Hook
segítségével olvas ki.

A lekérdezés eredményét a frontend a megfelelő komponenseknek adja át
megjelenítésre.

### 5.4. Csapat részleteinek megjelenítése

A csapat részletes oldala a kiválasztott csapat információit jeleníti
meg.

A felület felépítésében a `Team_details` komponens vesz részt. Feladata
a csapathoz tartozó alapvető információk megjelenítése.

A komponens különválasztása lehetővé teszi, hogy a csapat adatainak
megjelenítése ne keveredjen az oldal egyéb működési logikájával.

### 5.5. Csapathoz tartozó játékosok megjelenítése

A csapat részletes oldalán a csapathoz tartozó játékosok is
megjeleníthetők.

A játékosok adatainak lekérdezését a `PlayersService` végzi. A
`getPlayersByTeam` függvény segítségével a frontend egy adott csapathoz
tartozó játékosok listáját kéri le.

A megjelenítésért a `Team_players` komponens felel.

### 5.6. Csapatok szűrése

A csapatok szűrésének célja, hogy a felhasználó könnyebben megtalálhassa
a számára releváns csapatokat.

A szűrés során a kiválasztott feltételek alapján a frontend leszűkíti a
megjelenített csapatok körét.

A szűrési logika az oldal állapotkezeléséhez kapcsolódik. A felhasználó
által megadott feltételek módosulásakor a megjelenített lista is
frissül.

A szűrés pontos feltételeit és az egyes mezők működését a tényleges
implementáció alapján kell véglegesíteni.

### 5.7. Bajnokságok adatainak megjelenítése

A rendszerben a csapatokhoz kapcsolódó bajnokságok adatai is
lekérdezhetők.

A bajnokságok adatainak lekérésére az eddig megismert `getChampionships`
függvény szolgál, amely a `TeamsService` része.

A backend válaszát a frontend feldolgozza, majd a megfelelő felületi
komponensekben jeleníti meg.

### 5.8. Adminisztrátori felület

A projektben adminisztrátori felület kialakítása is folyamatban van.

Az adminisztrátori funkciók célja, hogy a megfelelő jogosultsággal
rendelkező felhasználó kezelhesse a rendszer adminisztrációs feladatait.

Az adminisztrátori műveletek elérhetőségét a backend
jogosultságkezelésének és a frontend megjelenítési logikájának
összehangolásával kell biztosítani.

A ténylegesen elkészült adminisztrátori műveleteket a végleges kód
alapján szükséges részletezni.

### 5.9. Csapatvezetői felület

A csapatvezetői felület célja, hogy a csapatvezető a saját szerepköréhez
tartozó funkciókat érhesse el.

A felület kialakításánál fontos szempont a szerepkörhöz kötött
hozzáférés. A felhasználó csak azokat a funkciókat használhatja,
amelyekhez a backend jogosultságkezelése hozzáférést biztosít.

A pontosan elérhető műveleteket a megvalósított funkciók alapján kell
felsorolni.

## 6. Adatkommunikáció a backenddel

A frontend és a backend külön alkalmazásrétegként működik. A frontend
HTTP-kéréseket küld a backend API-végpontjai felé, a backend pedig
feldolgozza a kéréseket és visszaküldi a szükséges adatokat.

Az adatkommunikációban az Axios könyvtár vesz részt.

Az alkalmazásban a szolgáltatásmodulok felelősek az API-hívások
összefogásáért. Így az oldalaknak és a komponenseknek nem kell
közvetlenül ismerniük az egyes végpontok technikai részleteit.

Egy tipikus adatlekérdezés folyamata:

1.  A felhasználó megnyit egy oldalt vagy elindít egy műveletet.
2.  Az oldal meghívja a megfelelő szolgáltatásfüggvényt.
3.  A szolgáltatás Axios segítségével elküldi a HTTP-kérést.
4.  A backend feldolgozza a kérést, majd választ küld.
5.  A frontend feldolgozza a választ.
6.  A komponens megjeleníti a kapott adatokat vagy a megfelelő
    hibaüzenetet.

## 7. Állapotkezelés és hibakezelés

A komponensek működéséhez szükséges adatokat a React állapotkezelési
mechanizmusai tárolják.

A `useState` segítségével kezelhetők például:

-   az űrlapok mezőinek értékei;
-   a lekérdezett adatok;
-   a betöltési állapotok;
-   a szűrési feltételek;
-   a hibaüzenetek.

Az adatlekérdezések során fontos, hogy a felhasználó visszajelzést
kapjon a folyamat állapotáról. Ezért a komponensek betöltési állapotot
és hibaállapotot is kezelhetnek.

Hiba esetén a frontend megfelelő üzenetet jeleníthet meg a felhasználó
számára ahelyett, hogy az alkalmazás működése megszakadna.

## 8. A felület stílusának kialakítása

Az alkalmazás megjelenését CSS-stíluslapok határozzák meg.

A stílusok komponensekhez vagy funkcionális területekhez kapcsolódó
fájlokban helyezkednek el. Ez a megoldás segít elkülöníteni az egyes
oldalak megjelenítését, valamint csökkenti annak esélyét, hogy egy
módosítás nem kívánt hatással legyen más felületekre.

A bejelentkezési felület például saját stílusfájlokat használhat a
bejelentkezési űrlap és a Google-bejelentkezési elem megjelenítésére.

## 9. Összegzés

A frontend egy React-alapú, komponensorientált webalkalmazás, amely a
felhasználók számára biztosítja a rendszer funkcióinak grafikus
elérését.

A projekt felépítése elkülöníti a megjelenítésért felelős komponenseket,
az oldalakat, a backenddel kommunikáló szolgáltatásokat és a
stíluslapokat.

A React biztosítja a dinamikus felület működését, a React Router az
oldalak közötti navigációt, az Axios a backenddel való kommunikációt, a
Google OAuth pedig a Google-fiókkal történő bejelentkezés lehetőségét.

A különálló komponensek és szolgáltatásmodulok használata átláthatóbbá,
könnyebben karbantarthatóvá és továbbfejleszthetővé teszi a frontend
kódbázisát.

## 10. A dokumentáció véglegesítéséhez ellenőrizendő adatok

A teljesen pontos, végleges dokumentáció elkészítéséhez az alábbiakat
érdemes a forráskóddal összevetni:

-   a `src` könyvtár teljes, aktuális struktúrája;
-   az `App.jsx` fájlban definiált összes útvonal;
-   az összes oldal és komponens neve, feladata;
-   az összes service-fájl és az általuk használt API-végpontok;
-   a bejelentkezés és a tokenek tényleges kezelési módja;
-   az adminisztrátori és csapatvezetői jogosultságokhoz kapcsolódó
    elkészült funkciók;
-   a csapat- és játékosszűrés pontos működése;
-   a környezeti változók és az alkalmazás konfigurációja.

Ezek ellenőrzése után a dokumentáció minden állítása pontosan
megfeleltethető a ténylegesen elkészült frontend megvalósításnak.
