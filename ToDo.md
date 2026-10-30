# ToDo list

## 1. Adatbázis

[**Részletek**: docs/01-database.md](docs/01-database.md)

- [x] Adatbázis megtervezése
  - [x] Táblák
  - [x] Mezők és adattípusok
  - [x] Kapcsolatok
  - [x] Django User használatának megtervezése
  - [x] Adatbázisdiagram elkészítése

## 2. Backend (Django)

- [x] Django projekt létrehozása
- [x] Django alkalmazás (app) létrehozása
- [x] PostgreSQL adatbázis létrehozása
- [x] Django `settings.py` összekötése a PostgreSQL adatbázissal
- [x] Modellek (`models.py`) elkészítése
  - [x] Championship
  - [x] Team
  - [x] Player
  - [x] Match
- [x] Adatbázis migrációk létrehozása (`makemigrations`)
- [x] Migrációk alkalmazása (`migrate`)
- [x] Első adminisztrátor létrehozása
- [x] Django Admin felület beállítása (`admin.py`)
- [x] Modellek és kapcsolatok tesztelése az Admin felületen
- [x] Django REST Framework beállítása
- [x] Serializerek elkészítése
- [x] API végpontok kialakítása
- [x] CRUD műveletek megvalósítása
- [x] Jogosultságkezelés
  - [x] Adminisztrátori jogosultságok
  - [x] Csapatvezetői jogosultságok
  - [x] Játékvezetői jogosultságok
- [ ] Google-bejelentkezés megvalósítása


## 3. Frontend (React + Vite)

- [x] Node.js és npm telepítése
- [x] React + Vite projekt inicializálása
- [x] Alap projektstruktúra kialakítása
  - [x] Globális CSS és sötét színvilág beállítása
  - [x] Navbar komponens létrehozása
- [x] React Router beállítása
- [ ] Oldalak és komponensek elkészítése
  - [x] Főoldal
  - [ ] Bajnokságok megjelenítése
  - [ ] Csapatok és játékosok megjelenítése
  - [ ] Mérkőzések és eredmények megjelenítése
  - [ ] Adminisztrációs és kezelőfelületek
- [ ] Formok és listák elkészítése
- [ ] API-kapcsolat kiépítése a Django REST Framework backenddel
- [ ] CRUD-műveletek integrálása
  - [ ] Adatok lekérése
  - [ ] Adatok létrehozása
  - [ ] Adatok módosítása
  - [ ] Adatok törlése
- [ ] Bejelentkezési felület kialakítása
  - [ ] Hagyományos bejelentkezés integrálása
  - [ ] Google-bejelentkezés integrálása
  - [ ] Bejelentkezési állapot kezelése
- [ ] Jogosultság alapján elérhető funkciók kezelése
  - [ ] Adminisztrátori funkciók
  - [ ] Csapatvezetői funkciók
  - [ ] Játékvezetői funkciók
- [ ] Frontend tesztelése és hibajavítás
- [ ] Production build elkészítése Vite segítségével


## 4. Tesztelés és finomítás

- [ ] Backend tesztelése
- [ ] API végpontok tesztelése
- [ ] Frontend tesztelése
- [ ] Jogosultságok tesztelése
- [ ] Google-bejelentkezés tesztelése
- [ ] Hibák javítása
- [ ] Felület finomítása
- [ ] Dokumentáció véglegesítése
- [ ] Beadandó szöveges részének összeállítása