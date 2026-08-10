# Naturboken – Projektstatus

> Denna fil fungerar som en delad "anslagstavla" mellan konversationer.
> Uppdatera efter betydande ändringar så andra konversationer vet vad som pågår.

*Senast uppdaterad: 2026-07-20*

---

## 🔄 Pågående arbete

| Konversation | Vad pågår | Berörda filer |
|---|---|---|
| – | – | – |

## ✅ Nyligen avslutat

| Datum | Konversation | Vad gjordes |
|---|---|---|
| 2026-08-10 | 🔍 Identifiera | Förbättrat svarsalternativ i Quiz: Felaktiga svarsalternativ väljs nu från samma artfamilj eller närbesläktade/liknande arter i `app.js` |
| 2026-08-10 | 🎨 Bildgenerering | Förenklat & förtydligat sekventiella SVG-ikoner för svårighetsgraderna (Förenklade och tydligare siluetter i samma stil som nybörjare-bilden) |
| 2026-08-10 | 🔍 Identifiera | Quiz: Fixat så att 'Spela igen'-knappen behåller den valda svårighetsgraden/kategorin i `app.js` |
| 2026-08-10 | 🎨 Bildgenerering | Skapat och lagt till gröna ikonbilder för alla val i Quiz-menyn i `index.html` och `style.css` |
| 2026-08-10 | 🎨 Bildgenerering | Omgenererat kategori-ikonen för Flugsnappare (`images/category_icons/flugsnappare.png`) med en flugsnappare som fångar en fluga |
| 2026-08-10 | 🔍 Identifiera | Quiz-repetitionsalgoritm: Utesluter nyligen rätt besvarade arter i `app.js` så endast felsvarade/nya arter återkommer |
| 2026-08-10 | 🔍 Identifiera | Utökat Quiz med miljö-kategorier (Vattenfåglar, Åkerfåglar, Skogsfåglar) i `index.html` och `app.js` |
| 2026-08-10 | 🐛 Bugg och fix | Dölja kamera- och papperskorgsikoner på stora bildkort i Min logg på mobilen (CSS media query) |
| 2026-07-29 | Min logg | Bokstrip: Sorterat bokraden samt baserat räknare på unika artobservationer, samt dolt Blom- och Trädböckerna (sammanslagna i Växtboken) |
| 2026-07-29 | 🔍 Identifiera | Quiz: Återinfört Quiz som en egen underflik (`sub-btn-quiz`) i Identifiera-vyn i `app.js` |
| 2026-07-29 | 🐛 Bugg och fix | Robust dataskydd: Persisted Storage API + AutoBackup (IndexedDB, 3 rullande snapshots) + ny backup-panel i Inställningar |
| 2026-07-27 | ✨ Features & UI | Kartklustring: Slagit ihop överlappande/nära GPS-markörer till en sammanställd lista i `app.js` |
| 2026-07-27 | 🎨 Bildgenerering | Skapat den gröna kategori-ikonen `images/category_icons/flugsnappare.png` samt uppdaterat `app.js` med `Flugsnappare`-tema |
| 2026-07-20 | 🎨 Bildgenerering | Ersatte lokalt genererade bilder med länkar till naturboken.alt-qq.com för fåglar och träd, tog bort bird_images.js |
| 2026-06-28 | 🐛 Buggar & Fix | Synkroniserade snabbtillägg i Fågelguide med Identifiera (asynkron GPS/plats/väder och toast-notiser) |
| 2026-05-27 | 🧭 Planering | Kodgranskning: fixat dubbletter (CSS, JS, data), skiftlägesfel i svampbilder, korsfilduplicering av havsörn |
| 2026-05-25 | 🧭 Planering | Skapat AGENTS.md och status.md för delad projektkontext |
| 2026-04-08 | – | Städning av kod och filstruktur (se `cleanup_log.md`) |

## ⚠️ Kända problem

*Inga kända problem just nu.*

## 📋 Att-göra-lista (Uppdelad per flik)

<!-- Skriv uppgifter här under respektive flik. Ändra [ ] till [/] när påbörjad, och [x] när klar -->

### 💼 Arbetsgivaren (Samordning & Ledning)
- [ ] Upprätthålla diskussioner, estimera svårighet och delegera uppgifter

### 🎨 Generera bilder
- [x] Skapa en ny ikonbild för flugsnappare (helgrön med vit bakgrund i `images/category_icons/flugsnappare.png`)
- [x] Omgenerera Flugsnappares ikonstil med en fågel som fångar en flygande fluga
- [ ] Generera silhuett-versioner av rovfåglar och andra fåglar

### 🐛 Bugg och fix
- [x] Räkna observerat antal baserat på antal unika arter (istället för totala loggningar)
- [x] Implementera robust dataskydd och säkerhetskopiering (Persisted Storage & Auto-backup)
- [x] Ta bort kamera- & papperskorgsikoner på stora bildkort i Min logg på mobilen

### ✨ Features & UI
- [ ] Skapa dagskalendern och möjlighet att skapa nya listor
- [x] Sortera listor/kategorier efter vilken man har loggat mest i
- [x] Karta: Slå ihop överlappande markörer till en sammanställd lista (clustering)
- [ ] Förbättra namngivning och etiketter i Inställningar (Settings) för bättre förståelse
- [ ] Lägga till informationsavsnitt/hjälp i Inställningar
- [ ] Skapa användarkonto-system (användarprofil & ID)
- [ ] Dela konto / se andras framsteg (profil-delning & statistik-kort)

### 📊 Artdata & Innehåll
- [x] Slå ihop Växtboken och Trädboken till en gemensam "Växtbok"

### 🚀 Deploy & Infra
- [ ] Utreda möjlighet att ändra mobilens visade app-ikon/PWA-ikon unikt per användare

### 🔍 Identifiera
- [x] Lägga till Quiz-läget igen under Identifiera
- [x] Utöka Quiz med miljö-kategorier (Vattenfåglar, Åkerfåglar, Skogsfåglar)
- [ ] Spara filter- & distansinställningar under Identifiera (Kom ihåg val i LocalStorage)

### 🧭 Planering
- [ ] *(Långsiktiga vägval och arkitektur)*

## 🔒 Fillås

<!-- Om en konversation arbetar intensivt med en specifik fil, notera det här för att undvika konflikter -->

| Fil | Låst av konversation | Sedan |
|---|---|---|
| – | – | – |
