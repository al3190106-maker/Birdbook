# Naturboken – Projektkontext för AI-agenter

> Denna fil läses av alla konversationer. Håll den uppdaterad.

## Projektöversikt

**Naturboken** är en svensk PWA (Progressive Web App) – en interaktiv naturguide för att identifiera och lära sig om svensk natur. Appen täcker fåglar, svampar, blommor, träd, fiskar och djur.

- **Live-URL:** https://al3190106-maker.github.io/Birdbook/
- **Repo:** GitHub Pages-deploy från `main`-grenen
- **Teknikstack:** Vanilla HTML/CSS/JS, TensorFlow.js (BirdNET-modell), Service Worker (PWA)
- **Språk:** Svenska (all UI och artdata)

## Filstruktur

```
├── index.html          # Huvud-HTML, all UI-struktur
├── style.css           # All CSS (~115 KB)
├── app.js              # Huvudlogik (~215 KB)
├── birds.js            # Fågeldata (275 arter)
├── bird_images.js      # Base64/URL-data för fågelbilder
├── fungi.js            # Svampdata
├── flowers.js          # Blomdata
├── trees.js            # Träddata
├── fish.js             # Fiskdata
├── animals.js          # Djurdata
├── nature.js           # Naturkategorier (paraply)
├── plants.js           # Växtparaply
├── listen.js           # Ljudigenkänning (BirdNET)
├── birdnet-worker.js   # Web Worker för BirdNET
├── audio-processor.js  # AudioWorklet
├── sweden-map.js       # SVG-karta
├── photographers.js    # Fotografkrediteringar
├── sw.js               # Service Worker
├── manifest.json       # PWA-manifest
├── images/             # Artbilder (270+ jpg)
│   ├── Identifiering/  # Identifieringsguider
│   ├── Fotografer/     # Fotografbilder
│   └── category_icons/ # Kategoriikoner
├── models/             # BirdNET TF.js-modell
├── scripts/            # Underhållsverktyg (ej runtime)
├── data_cache/         # Temporär cache-data
├── archive/            # Arkiverade filer
└── .agent/             # Agent-konfiguration
    └── workflows/      # Arbetsflöden
```

## Konversationsstruktur

Projektet använder dedikerade konversationer – **inte separata projekt**. Alla konversationer tillhör **samma projekt** och ska:

1. **Läsa denna fil** för gemensam kontext
2. **Uppdatera `.agent/status.md`** efter betydande ändringar
3. **Följa namnkonventionen** `Naturboken – [Kategori]`

### Aktiva konversationer

| Konversation | Scope | Beskrivning |
|---|---|---|
| 💼 **Arbetsgivaren** | Samordning | Projektledare, kravställning, diskussioner & delegering |
| 🎨 **Generera bilder** | Bilder | Artbilder, kategori-ikoner, fotografstilar |
| 🐛 **Bugg och fix** | Felsökning | CSS, JS, prestanda, PWA-problem |
| ✨ **Features & UI** | Utveckling | Nya funktioner, design, UX, navigering, inställningar |
| 📊 **Artdata & Innehåll** | Data | Artdatabas, texter, taxonomi, böcker |
| 🚀 **Deploy & Infra** | Ops | GitHub Pages, PWA, caching, optimering, ikoner |
| 🔍 **Identifiera** | AI & Kamera | Bildidentifiering, BirdNET-ljudigenkänning |
| 🧭 **Planering** | Strategi | Roadmap, prioritering, arkitektur |

### Regler för konversationer

- **Arbetsgivaren styr projektet:** Konversationen 💼 **Arbetsgivaren** är huvudledare. Den för alla kravdiskussioner med användaren, estimerar svårighet och lägger upp specifikationer i `.agent/status.md` och `task.md`.
- **Kolla anslagstavlan (.agent/status.md):** När du som flik (t.ex. *Generera bilder*, *Bugg och fix*, *Features & UI*, m.fl.) påbörjar ett arbete, MÅSTE du läsa `.agent/status.md` för att ta del av din tilldelade uppgift och specifikation från Arbetsgivaren.
- **Uppdatera vid färdigställande:** När du har utfört din uppgift ska du bocka av med `[x]` i `.agent/status.md` och logga ändringen under *✅ Nyligen avslutat*, så att Arbetsgivaren kan arkivera uppgiften.
- **Stanna inom scope:** En flik ska enbart utföra den exakt tilldelade/ombedda uppgiften.
- **Förslå "två flugor i en smäll" – Utför ALDRIG oombedda extrauppgifter:** Om du ser ett tillfälle där man kan slå två flugor i en smäll (t.ex. två närliggande uppgifter i samma fil), MÅSTE du först **föreslå detta för användaren** så att användaren kan avgöra situationen. Utför ALDRIG extrauppgifter automatiskt utan godkännande.
- **Konflikter:** Om två konversationer riskerar att redigera samma fil, koordinera via `.agent/status.md`.

## Arbetsregler

### Innan kodändringar
- Läs relevanta filer för att förstå befintlig struktur
- Kontrollera `.agent/status.md` för pågående arbete i andra konversationer

### 🔁 Krav på Kodåteranvändning (Obligatoriskt för ALLA flikar)
- **Sök innan du skapar nytt:** Innan du skriver en ny funktion, hjälpklass, modal, CSS-stil eller rendering, MÅSTE du söka i koden (`app.js`, `style.css`, etc.) efter befintlig funktionalitet.
- **Återanvänd befintliga komponenter:** Använd alltid befintliga helpers och UI-komponenter (t.ex. `getBirdImageSrc()`, `showToast()`, `nav.openModal()`, `getCurrentSpeciesList()`, `.category-card`, m.fl.) istället för att bygga duplicerade lösningar.
- **Ingen kodduplicering:** Om liknande logik finns ska den återanvändas eller utökas – skapa ALDRIG parallella dubblett-funktioner för samma ändamål.

### Efter kodändringar
- Kör `/after_changes` workflow för att pusha till GitHub
- Uppdatera `.agent/status.md` om ändringen påverkar andra konversationer

### Kodstil
- Svensk UI-text, engelska variabelnamn
- Inga externa ramverk (vanilla JS/CSS)
- Funktioner läggs i rätt modul (fågellogik i `birds.js`, etc.)
- Bilder sparas som `.jpg` i `images/`
