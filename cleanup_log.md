# Städlogg - Arbetspoäng (2026-04-08)

Denna logg dokumenterar alla ändringar som gjorts för att rensa upp i projektet och ta bort "död kod".

## 1. Filstruktur & Flyttade filer
För att göra rotkatalogen renare har underhållsskript och temporära filer flyttats till undermappar istället för att tas bort helt. Detta gör det enkelt att flytta tillbaka dem om de behövs i framtiden.

### Flyttade till `/scripts` (Underhållsverktyg)
Desea filer används endast av utvecklare för att uppdatera data och är inte en del av den körbara appen:
- `add_best_time.js`
- `apply_audio.js`
- `check_links.js`
- `check_links_html.js`
- `fetch.js`
- `fetch_audio.js`
- `fetch_inat.js`
- `fix_categories.ps1`
- `fix_fungi.js`
- `match_ids.js`
- `replace_giant_puffball.js`
- `test_api.js`
- `update_fungi_data.js`
- `update_images.js`
- `verify_categories.ps1`
- `verify_fungi.js`

### Flyttade till `/data_cache` (Temporär data)
Mellanlagrad data från skriptkörningar:
- `inat_results.json`
- `invalid_links.json`
- `valid_links.json`
- `wikidata_audio.json`

### Flyttade till `/archive` (Gamla rester)
- `birdnet-pwa-temp` (Innehållet flyttat, `.git`-mappen kan kräva manuell radering pga rättigheter).

---

## 2. CSS-städning (`style.css`)
Följande block har raderats då de refererar till funktioner som inte längre finns i HTML:
- **Synkronisering:** Klasser som `.sync-status`, `.sync-icon`, `.sync-text`, `.synced`, `.syncing`, `.offline` samt animationen `@keyframes syncPulse`.
- **Gammal inspelning:** Klasser som `.audio-recording-controls`, `.record-btn`, `.recording-status` samt animationerna `@keyframes pulse-red` och `@keyframes fade-in-out`.

---

## 3. JavaScript-städning (`app.js`)
- **Dubbletter:** Tog bort dubblerad konfigurationsrubrik längst upp i filen.
- **Logikfix:** Förenklade modal-stängning i `popstate`-hanteraren genom att ta bort undantag för `password-modal` och `welcome-modal` (som inte längre används).

---

> [!TIP]
> Om appen mot förmodan skulle krascha på grund av en saknad stil, kan du hitta de gamla stilarna i versionshistoriken eller återställa dem från beskrivningen ovan. De flyttade filerna fungerar fortfarande precis som vanligt inifrån sina nya mappar.
