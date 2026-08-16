# Naturboken – Projektstatus

> Denna fil fungerar som en delad "anslagstavla" mellan konversationer.
> Uppdatera efter betydande ändringar så andra konversationer vet vad som pågår.

*Senast uppdaterad: 2026-08-12*

---

## 📌 Noteringar & Terminologi till Arbetsgivaren

- **Fågelkort:** Användaren benämner artdetaljmodalen (`.bird-detail-modal` i HTML/CSS) som **"fågelkort"**. Detta syftar alltså på popup-kortet/modalen som öppnas när man klickar på en art eller observation (visar bildkarusell, faktaruta, datum, plats m.m.).

## 🔄 Pågående arbete

| Konversation | Vad pågår | Berörda filer |
|---|---|---|
| 🎴 Fågelkort | 👋 Redo för arbetsuppgifter! Uppkopplad, har granskat `.bird-detail-modal` och väntar på uppdragsinstruktioner. | `index.html`, `style.css`, `app.js` |

## ✅ Nyligen avslutat

| Datum | Konversation | Vad gjordes |
|---|---|---|
| 2026-08-16 | 🎴 Fågelkort | Uppgift 28 (Del 2): Korrigerat den trasiga Artportalen-länken till SLU Artfaktas officiella art-sökportal (`https://artfakta.se/search?q=...`) i `app.js` och `index.html` |
| 2026-08-16 | 🎴 Fågelkort | Uppgift 28 (Del 1): Standardiserat fotografkreditering till Naturboken som fallback för alla genererade & egna bilder i bildkarusellen och helskärmsvisningen (`photographers.js`, `app.js`) |
| 2026-08-16 | 📊 Artdata & Innehåll | Uppgift 27: Korrigerat artdata & viktenheter för alla icke-fågelböcker (`fish.js`, `animals.js`, `trees.js`) – konverterat alla viktvärden från gram till kg så att de stämmer med UI-enheterna samt lagt till träder-åldrar |
| 2026-08-16 | 💼 Arbetsgivaren | Uppdaterad projektregel i AGENTS.md: Om en flik ser ett tillfälle att slå "två flugor i en smäll", MÅSTE fliken föreslå detta för användaren först. Utför ALDRIG oombedda extrauppgifter utan explicitt godkännande. |
| 2026-08-15 | 🚀 Deploy & Infra | Uppgift 26: Privat besöksstatistik & användaranalys via Google Analytics 4 (Measurement ID: `G-471QWLB8LB`) med anonym spårning för besök, bokbyten, sparade observationer och quiz i `index.html` och `app.js` |
| 2026-08-12 | 🚀 Deploy & Infra | PWA Auto-Reload: Lagt till `controllerchange` event-lyssnare i `index.html` som automatiskt laddar om sidan så fort en ny version aktiverats, vilket gör att användare slipper rensa cache manuellt |
| 2026-08-12 | 📊 Statistik | Fixat beräkning av kategoristapel-bredder (`w`): Ändrat från felaktig totalkvot till användarens faktiska observationstäckning (`pct = seen / total`), så att tomma kategorier (0 observerade) nu visas helt tomma (0%) istället för felaktigt maxade (100%) |
| 2026-08-12 | 📊 Statistik | Designuppfräschning av Statistikfliken: Tagit bort alla plottriga och tunga kantlinjer, infört stilren toppbannér (`stats-header-banner`), luftigare rullgardinskort, renare snabböversiktskort med mjuka cirkelikoner samt snyggare utmärkelser utan skarpa skarvar |
| 2026-08-12 | 🔍 Identifiera | Format-separerad Bildvisning: Lagt till klassificering för foto (`.img-type-foto`) och illustration (`.img-type-illustration`) i `app.js` och `style.css` så att fotografier visas med naturlig storlek (`scale(1.05)`) medan illustrationer skalas upp (`scale(1.45)`) utan beskärningsproblem |
| 2026-08-12 | 🔍 Identifiera | Inställning för Quiz-bilder: Låst upp och lagt till valet "Frågebilder i Quiz" under Inställningar i `index.html` och `app.js` så att användare fritt kan välja mellan illustrationer (v1/v2) eller högupplösta fotografier som fyller skärmen |
| 2026-08-12 | 🔍 Identifiera | Quiz Sömlös Vit Bakgrund: Ändrat quiz-sidans bakgrund till ren vit (`#ffffff`) i `style.css` så att illustrationernas vita canvasar smälter in 100% och tar bort alla sidospalter |
| 2026-08-12 | 🔍 Identifiera | Quiz-bildskalning: Höjt zoom-skalningen till 1.75× (`transform: scale(1.75)`) i `style.css` för att förstora fåglarna rejält oavsett bildfilens inbyggda marginaler |
| 2026-08-12 | 🐛 Bugg och fix | Chrome Flexbox-layout Fix: Tog bort dynamisk aspect-ratio beräkning (`fitQuizImage`) från `app.js` som krockade med Chrome mobils Flexbox-motor och krympte bilderna |
| 2026-08-12 | 🔍 Identifiera | Quiz Framträdande Bildvisning: Ställt in full flexbredd/höjd (`width: 100%`, `flex: 1`) samt balanserad 1.35× zoom-skalning i `style.css` så att bilder blir rejält stora utan beskärning |
| 2026-08-12 | 🚀 Deploy & Infra | PWA Caching Update: Höjt Service Worker cache-version till `v4.5.1` i `sw.js` för att rensa gammal trasig minnescache i användarnas mobiler |
| 2026-08-12 | 🐛 Bugg och fix | Återställd app-parsningsfel: Fixat saknad klammerparentes i `preloadQuizImages` i `app.js` som orsakat syntaxfel och förhindrat att sparade fynd och knappar laddades |
| 2026-08-12 | 🔍 Identifiera | Quiz Dynamisk Proportionstillsättning (`fitQuizImage`): Implementerat dynamisk `aspect-ratio` beräkning i `app.js` och `style.css` så att hela bilden visas utan att beskäras ELLER lämna tomma luftyter |
| 2026-08-12 | 🔍 Identifiera | Quiz Bildutfyllnad (`object-fit: cover`): Ändrat från `contain` till `cover` i `style.css` så att bilder täcker 100% av kortytan utan luftglapp eller tomrum kring motivet |
| 2026-08-12 | 🔍 Identifiera | Quiz Ramlös Bildvisning: Tog bort alla bakgrundsramar och oskarpa bakgrundsrutor kring quiz-bilden helt (`background: transparent`, `box-shadow: none`, `border: none`) i `app.js` och `style.css` |
| 2026-08-12 | 🔍 Identifiera | Adaptiv Quiz-design: Byggt om bildvisningen med färgmatchad oskarp bakgrund (`.quiz-img-bg-blur`) för att eliminera tomma ytor oavsett bildformat (stående/liggande) samt begränsat bredd/höjd för datorer (`@media (min-width: 768px)`) i `app.js` och `style.css` |
| 2026-08-12 | 🔍 Identifiera | Quiz 100% Skärmhöjdsutnyttjande: Tog bort alla fasta höjdbegränsningar/mediaqueries, tajtat till marginaler och ställt in 1.65× zoom-skalning i `style.css` så att hela skärmens höjd utnyttjas till 100% |
| 2026-08-12 | 🔍 Identifiera | Quiz Responsiv Flexbox: Byggt om layouten med dynamisk Flexbox (`flex: 1` + `justify-content: space-between`) i `style.css` så att bilden automatiskt expanderar till 100% av användarens tillgängliga skärmyta oavsett mobilmodell och skärmbredd |
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
- [ ] **Framtida uppgift (Artdata):** Komplettera fågelgrupperingar/familjer i `birds.js` så att alla arter har exakt taxonomisk gruppering för framtida faktamappning
- [ ] **Framtida uppgift (Artkort & Fakta):** Översyn & anpassning av faktafält för alla övriga böcker (Fiskboken, Svampboken, Växtboken, Däggdjursboken) så att även dessa får unika & värdefulla faktrutor anpassade för sitt ämne

### 🎴 Fågelkort (Artdetaljkort & Modaler)
- [ ] Ansvara för `.bird-detail-modal`, bildkaruseller, artfakta, mått & popup-detaljer
- [/] Uppgift 28: Översyn & rensning av information på Fågelkorten (Bort med 'Aktiv: morgon', in med förslag på värdefulla faktafält)

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
- [x] Förbättra namngivning och etiketter i Inställningar (Settings) för bättre förståelse
- [x] Lägga till informationsavsnitt/hjälp i Inställningar
- [ ] Skapa användarkonto-system (användarprofil & ID)
- [ ] Dela konto / se andras framsteg (profil-delning & statistik-kort)
- [x] Visa antal genomförda Quiz i Statistiken
- [x] Bok-anpassad Statistik-vy (Ämnesspecifik statistik per bok + Samlad översikt i Naturboken)
- [x] Kom ihåg & öppna senast använda boken vid sidladdning (LocalStorage)
- [x] Filtrera kartan per aktiv bok (Visa endast bokens observationer på kartan)

### 📊 Artdata & Innehåll
- [x] Slå ihop Växtboken och Trädboken till en gemensam "Växtbok"
- [x] Utöka fågeldatabasen med GBIF Sverige 2026 (257 → 395 unika arter, +138 nya)
- [x] Korrigera artdata & viktenheter för alla böcker (Fiskboken, Viltboken, Svampboken, Växtboken)

### 🚀 Deploy & Infra
- [x] Uppgift 26: Privat besöksstatistik & användaranalys via Google Analytics 4 (`G-471QWLB8LB`)
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
