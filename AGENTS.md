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
| 🎨 **Bildgenerering** | Bilder | Artbilder, identifieringsbilder, fotografstilar |
| 🐛 **Buggar & Fix** | Felsökning | CSS, JS, prestanda, PWA-problem |
| ✨ **Features & UI** | Utveckling | Nya funktioner, design, UX, navigering |
| 📊 **Artdata & Innehåll** | Data | Artdatabas, texter, taxonomi |
| 🚀 **Deploy & Infra** | Ops | GitHub Pages, PWA, caching, optimering |
| 🧭 **Planering** | Strategi | Roadmap, prioritering, arkitektur |

### Regler för konversationer

- **Stanna inom scope** – en buggfix-konversation ska inte börja bygga nya features
- **Referera till andra konversationer** – om du stöter på arbete utanför ditt scope, notera det och hänvisa användaren till rätt konversation
- **Uppdatera status** – efter betydande arbete, uppdatera `.agent/status.md`
- **Konflikter** – om två konversationer riskerar att redigera samma fil, koordinera via `.agent/status.md`

## Arbetsregler

### Innan kodändringar
- Läs relevanta filer för att förstå befintlig struktur
- Kontrollera `.agent/status.md` för pågående arbete i andra konversationer

### Efter kodändringar
- Kör `/after_changes` workflow för att pusha till GitHub
- Uppdatera `.agent/status.md` om ändringen påverkar andra konversationer

### Kodstil
- Svensk UI-text, engelska variabelnamn
- Inga externa ramverk (vanilla JS/CSS)
- Funktioner läggs i rätt modul (fågellogik i `birds.js`, etc.)
- Bilder sparas som `.jpg` i `images/`
