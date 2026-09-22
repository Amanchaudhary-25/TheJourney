# The Journey — A place to remember when something began.

> *"We create the experience. You own the memories."*

**The Journey** is a luxury, privacy-first digital time capsule and elapsed-time counter. It allows anyone to record a meaningful beginning, observe the passage of time second by second, curate memories and milestones, seal letters to their future self, and retain full ownership of their data through a **Bring Your Own Space (BYOS)** architecture.

---

## Key Highlights

- **Zero-Friction Default Experience**: Opens instantly with the default starting date of **18 December 2022** and the inscription: *"We together fulfill our dreams, promises and what we have thought of."*
- **Calendar-Aware Elapsed Time Calculation**: Accurately handles leap years, variable month durations (28, 29, 30, 31 days), February, and daylight changes.
- **Three Time Modes**:
  - `SINCE`: Counting upward from a past beginning.
  - `UNTIL`: Counting downward toward a future milestone.
  - `BETWEEN`: Measuring the calendar duration between two specific dates.
- **Dual Display Modes**:
  - **Calendar View**: Years · Months · Days · Hours · Minutes · Seconds (with rolling live digit transitions).
  - **Total Time View**: Total Days, Total Hours, Total Minutes, Total Seconds.
- **Privacy-First (BYOS) Architecture**:
  - Browser **IndexedDB** handles local persistence for all memories, milestones, future letters, and high-res photos.
  - Zero required signup, no forced email or centralized database.
  - Pluggable Cloud Storage adapters for **Google Drive** (`The Journey/` folder), **Microsoft OneDrive**, and **Dropbox**.
- **Memory Timeline**:
  - Vertical chronological timeline with custom symbols, locations, tags, and local photo compression.
- **Journey Milestones**:
  - Automatic milestone detection (100 days, 365 days, 500 days, 1,000 days, 1,500 days, 5 years, 10 years...) with next milestone countdown and progress bar.
  - Custom milestone creator and celebration confetti.
- **A Letter to the Future**:
  - Digital time capsules sealed with an unlock date. Remains locked until the target date arrives.
- **Share & Export**:
  - Download high-res shareable visual card as PNG rendered on HTML5 Canvas.
  - Generate dynamic QR Code.
  - Web Share API and link copying (with hash encoding `#j=...` for self-contained link sharing).
  - One-click export to portable **ZIP archive** or **JSON** (with photos).
- **Five Premium Atmospheres**:
  - **Midnight**: Dark futuristic cosmos with star dust.
  - **Aurora**: Ethereal northern emerald luminescence.
  - **Sunset**: Warm cinematic dusk and ember horizons.
  - **Serenity**: Soft natural dawn and slate stillness.
  - **Minimal**: Pure monochrome typography and negative space.
- **PWA & Offline-First**:
  - Installable Web App Manifest, Service Worker caching, and full offline functionality.

---

## Project Structure

```text
/
├── index.html                    # Entry HTML with Cinzel & Cormorant fonts, OpenGraph metadata
├── metadata.json                 # AI Studio applet metadata
├── public/
│   ├── favicon.svg               # Minimalist orbital time SVG icon
│   ├── manifest.json             # Web App Manifest for PWA installation
│   └── sw.js                     # Service Worker for offline-first caching
├── src/
│   ├── components/
│   │   ├── AmbientCanvas.tsx     # Ethereal floating particles and cursor light
│   │   ├── CountdownDisplay.tsx  # Calendar vs Total time view grid
│   │   ├── CustomizeJourneyModal.tsx # 6-Step guided journey creation flow
│   │   ├── FutureLettersModal.tsx # Sealed time capsule letters to the future
│   │   ├── JourneyHeader.tsx     # Cinematic title, date pill, and milestone tracker
│   │   ├── LiveDigit.tsx         # Tabular numerals with rolling digit transition
│   │   ├── MemoryTimeline.tsx    # Chronological memory timeline with photo attachments
│   │   ├── MilestonesPanel.tsx   # Auto milestones, custom milestones, and celebration
│   │   ├── QuoteDisplay.tsx      # Editorial italic serif quote display
│   │   ├── ShareModal.tsx        # High-res canvas card exporter & QR generator
│   │   └── StorageSettingsModal.tsx # BYOS storage selector, ZIP/JSON export/import
│   ├── services/
│   │   └── storage/
│   │       ├── CloudStorageAdapters.ts # Google Drive, OneDrive, Dropbox adapters
│   │       ├── defaultJourney.ts       # 18 Dec 2022 seed journey and memories
│   │       ├── IndexedDBProvider.ts    # Native browser IndexedDB engine
│   │       ├── storageService.ts       # Unified StorageManager facade with JSZip
│   │       └── types.ts                # StorageProvider interface definition
│   ├── styles/
│   │   └── themes.ts             # 5 curated luxury atmospheric themes
│   ├── utils/
│   │   └── dateCalculations.ts   # Calendar-aware leap-year precise elapsed-time engine
│   ├── App.tsx                   # Main orchestrator component
│   ├── index.css                 # Tailwind base styles and font declarations
│   ├── main.tsx                  # React DOM entry point
│   └── types.ts                  # TypeScript models and interfaces
└── package.json
```

---

## Data Schema (Version 1)

```json
{
  "version": 1,
  "exportedAt": "2026-09-17T14:00:00.000Z",
  "journey": {
    "id": "default-journey-2022",
    "title": "The Journey",
    "subtitle": "The journey began here.",
    "mode": "since",
    "startDate": "2022-12-18T00:00:00.000Z",
    "endDate": null,
    "hasStartTime": false,
    "description": "The day everything began.",
    "quote": "We together fulfill our dreams, promises and what we have thought of.",
    "theme": "midnight",
    "createdAt": "2022-12-18T00:00:00.000Z",
    "updatedAt": "2026-09-17T14:00:00.000Z"
  },
  "memories": [
    {
      "id": "mem-1",
      "journeyId": "default-journey-2022",
      "date": "2022-12-18T00:00:00.000Z",
      "title": "The Beginning",
      "description": "The moment the path opened.",
      "symbol": "✦"
    }
  ],
  "milestones": [
    {
      "id": "mile-1000",
      "journeyId": "default-journey-2022",
      "days": 1000,
      "label": "1,000 Days",
      "isCustom": true
    }
  ],
  "futureLetters": [
    {
      "id": "letter-1",
      "journeyId": "default-journey-2022",
      "title": "To Us on Year Five",
      "message": "...",
      "unlockDate": "2027-12-18T00:00:00.000Z"
    }
  ],
  "settings": {
    "ambientParticles": true,
    "cursorGlow": true,
    "soundEnabled": false,
    "notificationsEnabled": false,
    "prefersReducedMotion": false,
    "storageProvider": "indexeddb"
  }
}
```

---

## Getting Started

### Development
```bash
npm install
npm run dev
```

### Type Checking & Linting
```bash
npm run lint
```

### Production Build
```bash
npm run build
```

---

## Static Deployment

The core application is completely client-side and requires zero backend:
- **Vercel / Netlify / Cloudflare Pages**: Connect your Git repository, set build command to `npm run build` and output directory to `dist`.
- **GitHub Pages**: Deploy the compiled `dist/` directory directly.
