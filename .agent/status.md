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

### 🐛 Bugg och fix
- [ ] Räkna observerat antal baserat på antal unika arter (istället för totala loggningar)
- [x] Implementera robust dataskydd och säkerhetskopiering (Persisted Storage & Auto-backup)

### ✨ Features & UI
- [ ] Skapa dagskalendern och möjlighet att skapa nya listor
- [ ] Sortera listor/kategorier efter vilken man har loggat mest i
- [x] Karta: Slå ihop överlappande markörer till en sammanställd lista (clustering)
- [ ] Förbättra namngivning och etiketter i Inställningar (Settings) för bättre förståelse
- [ ] Lägga till informationsavsnitt/hjälp i Inställningar

### 📊 Artdata & Innehåll
- [ ] Slå ihop Växtboken och Trädboken till en gemensam "Växtbok"

### 🚀 Deploy & Infra
- [ ] Utreda möjlighet att ändra mobilens visade app-ikon/PWA-ikon unikt per användare

### 🔍 Identifiera
- [ ] *(Inga aktiva uppgifter)*

### 🧭 Planering
- [ ] *(Långsiktiga vägval och arkitektur)*

## 🔒 Fillås

<!-- Om en konversation arbetar intensivt med en specifik fil, notera det här för att undvika konflikter -->

| Fil | Låst av konversation | Sedan |
|---|---|---|
| – | – | – |
