# Naturboken – Projektstatus

> Denna fil fungerar som en delad "anslagstavla" mellan konversationer.
> Uppdatera efter betydande ändringar så andra konversationer vet vad som pågår.

*Senast uppdaterad: 2026-08-12*

---

## 🔄 Pågående arbete

| Konversation | Vad pågår | Berörda filer |
|---|---|---|
| – | – | – |

## ✅ Nyligen avslutat

| Datum | Konversation | Vad gjordes |
|---|---|---|
| 2026-08-12 | 🔍 Identifiera | Quiz-bildskalning: Höjt zoom-skalningen för quiz-bilder till 1.5× (`transform: scale(1.5)`) i `style.css` |
| 2026-08-12 | 🔍 Identifiera | Quiz-bildskalning: Höjt bildhöjden till `68vh` (upp till `720px`) och lagt till 1.25× zoom-skalning för att få fågelbilden att ta upp nästan hela skärmytan i `style.css` |
| 2026-08-12 | 🔍 Identifiera | Quiz-bildskärpa & storlek: Åtgärdat felaktig nedskalning från Wikimedia (ändrat från 320px till HD 800px) i `app.js` samt höjt bildhöjden till `60vh` (upp till `680px` höjd) i `style.css` för stor och knivskarp visning |
| 2026-08-12 | 🔍 Identifiera | Quiz-bildstorlek: Utökat bildytan ytterligare till `58vh` (upp till `640px` höjd och `850px` bredd) samt minskat marginaler för maximal visning på alla skärmar |
| 2026-08-12 | 🔍 Identifiera | Quiz-bildoptimering: Tog bort bakgrundsramen runt quiz-bilden helt (`background: transparent`) samt maximerade bildhöjden (`52vh` / upp till `550px`) med mjuk `drop-shadow` i `style.css` |
| 2026-08-12 | 🔍 Identifiera | Quiz UI-design: Matchat layouten exakt från användarens skärmdump – mörkgrön toppbar (#274c3d) med boktitel & Quiz-badge, ljusgrön bakgrund (#eef3f0), centrerad "FRÅGA 1 AV 10"-piller samt 2x2 svarskortsmatris i `index.html`, `app.js` och `style.css` |
| 2026-08-12 | 🐦 Fågelguide | Uppgift 20: Externa GBIF-arter i "Nära mig" får snygga kort (teal placeholder, feather-ikon), klickbara med live-hämtning av sv-namn + bild från GBIF API i `sightings.js` + `style.css` |
| 2026-08-12 | 🐦 Fågelguide | GBIF-expansion: Lade till 138 nya fågelarter i `birds.js` via GBIF Sverige 2026-analys (totalt 395 unika arter, upp från 257). Inkluderar svenska namn, fakta, mått, ljud och bilder. |
| 2026-08-12 | 🔍 Identifiera | Quiz-bildvisning: Ändrat bildvisningen till `object-fit: contain` med mörk stilren ram (`#0f172a`) i `style.css` så att hela fågelbilden syns utan beskärning |
| 2026-08-11 | 🔍 Identifiera | Quiz-städning: Tog bort poängräknaren (0/10) och Avsluta-knappen från toppen i `index.html` och `app.js` |
| 2026-08-11 | 🔍 Identifiera | Quiz-layout: Tagit bort rubriktexten "Vilken fågel ser du på bilden" för bildfrågor samt låst svarsknapparna till en 2x2-matris (grid) på alla skärmar |
| 2026-08-11 | 🔍 Identifiera | Quiz i Helskärmsläge: Gjort om aktivt Quiz & Resultatskärm till helskärmsläge i `style.css` så att fågelbilderna får maximal vertikal höjd (`48vh` / upp till `520px`) |
| 2026-08-11 | 📊 Statistik | Skapat unika & tematiska utmärkelser (achievements) för varje ämnesbok: Fiskboken (Gäddkungen, Havets rovfisk, Storfiskaren), Svampboken (Guld i skogen, Giftspejaren), Växtboken (Skogens jättar, Sommaräng, Botaniker), Viltboken (Rovdjursspanaren, Skogens konung, Spårhunden) |
| 2026-08-11 | 📊 Statistik | Ämnesspecifika Utmärkelser (Badges): Fågel-achievements visas nu enbart i Fågelboken & Naturboken. Respektive bok (Fisk, Svamp, Växter, Vilt) visar nu enbart sina egna bok-specifika och universella utmärkelser |
| 2026-08-11 | 📊 Statistik | Fixat bugg i statistikrendering: Återställt hjälparfunktionen `row` samt fixat felaktig variabelreferens (`s.loggedBirds`), så alla hopfällbara rullgardiner fylls med sin korrekta data |
| 2026-08-11 | ✨ Features & UI | Uppgift 24: Kom ihåg & öppna senast använda boken vid sidladdning – Sparar och laddar senast aktiva boken från `localStorage` (`naturboken_last_subject`) före rendering i `app.js` |
| 2026-08-11 | 📊 Statistik | Slimmat ner och mobilanpassat rutorna under "Översikt i siffror" med horisontell kompakt flex-layout och minskad padding för perfekt visning på mobilen |
| 2026-08-11 | 📊 Statistik | Tagit bort den stora "level up"-rangrutan högst upp i statistikvyn samt dolt quiz-statistik för böcker där quiz inte finns (visas endast för Fågelboken & Naturboken) |
| 2026-08-11 | 📊 Statistik | Uppgift 23: Bok-anpassad Statistik-vy – Statistikfliken anpassas nu dynamiskt efter den aktiva boken (Fågelboken, Fiskboken, Svampboken, Växtboken, Viltboken) med ämnesspecifik arttäckning, raritetsfördelning, quizframsteg och snabbsiffror, samt samlad översikt i Naturboken |
| 2026-08-11 | 🔍 Identifiera | Quiz-bildoptimering: Implementerat bakgrunds-förladdning (`preloadQuizImages`) samt skelett-animering (`skeleton shimmer`) & spinner under laddning i `app.js` och `style.css` |
| 2026-08-11 | 📊 Statistik | Synkroniserat sällsynthetsfärgerna i statistikfliken (Sällsynthetsscore & Sällsyntaste fågeln) så att de följer exakt samma färgtema som fågelkorten (`#94a3b8`, `#16a34a`, `#2563eb`, `#9333ea`, `#ea580c`) |
| 2026-08-11 | 🔍 Identifiera | Quiz: Filtrerar bort alla arter som helt saknar bild i `app.js` (tillåter endast arter med riktig eller genererad bild) |
| 2026-08-11 | 📊 Statistik | Gjort om samtliga statistiksektioner (Översikt i siffror, Fågelstatistik, Naturprofil, Utmärkelser, Quiz, Tid & Plats, Sällsynthet) till hopfällbara rullgardiner utom första Profil/Rang-kortet ("bemärkelsen") |
| 2026-08-11 | 🐛 Bugg och fix | Fixat Quiz-bilder: Prioriterar alltid giltiga bild-URL:er (`explicitItem.image`) istället för att tvinga fram saknade lokala `images/*.jpg`-filer i `app.js` |
| 2026-08-11 | 🐛 Bugg och fix | Uppgift 21: Rena knappstilar och platte/rena färgteman för Naturboken & Växtboken (Tog bort gradienter och skuggor/specialeffekter i `style.css`) |
| 2026-08-11 | 📊 Statistik | 👋 "Hej! 📊 Statistik är uppkopplad, redo och insatt i hur uppgifter från Arbetsgivaren tas emot!" |
| 2026-08-11 | 🐛 Bugg och fix | Uppgift 22: Centrerat alla bilder i Fiskboken och tagit bort den vertikala förskjutningen i CSS (`body.mode-fish` `object-position: center center`) |
| 2026-08-11 | ✨ Features & UI | 👋 "Hej! ✨ Features & UI är redo och uppkopplad för nya utvecklingsuppgifter!" |
|---|---|---|
| 2026-08-11 | 🔍 Identifiera | Uppgift 18: Sparar och återställer valda filter, radie/distans, aktiv underflik och quiz-svårighetsgrad under Identifiera via `localStorage` |
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
- [x] Rena knappstilar & tema för Naturboken & Växtboken (Ta bort skuggor/specialeffekter)
- [x] Centrera bilder i Fiskboken (Ta bort vertikal förskjutning i CSS)

### ✨ Features & UI
- [ ] Skapa dagskalendern och möjlighet att skapa nya listor
- [x] Sortera listor/kategorier efter vilken man har loggat mest i
- [x] Karta: Slå ihop överlappande markörer till en sammanställd lista (clustering)
- [ ] Förbättra namngivning och etiketter i Inställningar (Settings) för bättre förståelse
- [ ] Lägga till informationsavsnitt/hjälp i Inställningar
- [ ] Skapa användarkonto-system (användarprofil & ID)
- [ ] Dela konto / se andras framsteg (profil-delning & statistik-kort)
- [x] Visa antal genomförda Quiz i Statistiken
- [x] Bok-anpassad Statistik-vy (Ämnesspecifik statistik per bok + Samlad översikt i Naturboken)
- [x] Kom ihåg & öppna senast använda boken vid sidladdning (LocalStorage)

### 📊 Artdata & Innehåll
- [x] Slå ihop Växtboken och Trädboken till en gemensam "Växtbok"
- [x] Utöka fågeldatabasen med GBIF Sverige 2026 (257 → 395 unika arter, +138 nya)

### 🚀 Deploy & Infra
- [ ] Utreda möjlighet att ändra mobilens visade app-ikon/PWA-ikon unikt per användare

### 🔍 Identifiera
- [x] Lägga till Quiz-läget igen under Identifiera
- [x] Utöka Quiz med miljö-kategorier (Vattenfåglar, Åkerfåglar, Skogsfåglar)
- [x] Spara filter- & distansinställningar under Identifiera (Kom ihåg val i LocalStorage)
- [x] Fågelkort med v2-bilder & detaljer för externa arter i "Nära mig"

### 🧭 Planering
- [ ] *(Långsiktiga vägval och arkitektur)*

## 🔒 Fillås

<!-- Om en konversation arbetar intensivt med en specifik fil, notera det här för att undvika konflikter -->

| Fil | Låst av konversation | Sedan |
|---|---|---|
| – | – | – |
