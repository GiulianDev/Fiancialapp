# ARCHITECTURE.md - Architettura Applicazione Finanziaria

## Panoramica dell'Applicazione
Questa applicazione web è un'applicazione **Single Page Application (SPA)** basata su **React**, costruita con l'ecosistema Vite e TypeScript. Il design segue principi di minimalismo moderno con effetti glassmorphism, utilizzando una palette neutra accenti in azzurro elettrico e viola.

L'app gestisce le funzionalità core per la visualizzazione e analisi del portafoglio (ETF), l'autenticazione utente e la navigazione multi-vista.

---

## 1. Architettura dei Livelli (Layers Architecture)

L'applicazione segue un pattern stratificato chiaro per mantenere il codice pulito e testabile:

- **Presentation Layer (UI):** Componenti React che gestiscono il rendering.
- **Logic Layer (Hooks & Context):** Business logic separata, gestione stati globali (Context API) e logica asincrona custom hooks.
- **Data Layer (Services):** Strato di accessibilità ai dati, astrazione dalla libreria Firebase.

---

## 2. Flusso dei Dati (Data Flow)

Il ciclo di vita dei dati segue il modello **"Data Down"** per i dati statici e lo stato globale tramite **Context API**, mentre l'uso di **Custom Hooks** astrae la complessità dai servizi.

### A. Accesso ai Dati (Database -> Services)
I componenti UI non interagiscono direttamente con Firebase. Invece, usano i servizi definiti in `src/shared/services/`:

1.  **Firebase Initialization:** Configurazione unica gestita a livello di app (`initFirebase`).
2.  **Service Abstraction:**
     *   `portfolioService.ts`: Interfaccia per CRUD delle operazioni (GET portafoglio, POST nuova holding).
     *   `authService.ts`: Gestione autenticazione utente.
3.  **Data Fetching:** I servizi eseguono le chiamate asincrone e ritornano promesse.

### B. Logica di Business (Hooks)
I servizi vengono consumati dai **Custom Hooks** situati in `src/features/.../use*`:
- Esempio: `useHoldingMainDetails.ts` chiama `portfolioService.getAllHoldings()`.
- I Hook gestiscono lo stato locale del componente, trasformazioni dei dati (es. calcoli percentuali) e ritorni di valore per il consumo UI.

### C. Stato Globale (Context API)
Per lo stato condiviso tra diversi componenti della feature (es. Selezione Favorite), vengono utilizzati i **Context Provider**:
- `PortfolioContext`: Mantiene la lista delle holdings, stati di caricamento e dati calcolati globali.
- `FavoritesContext`: Gestisce l'insieme degli elementi preferiti in memoria.

### D. Rendering UI (Components)
I componenti finali:
1. Consumano lo stato dal **Context** o i valori dai **Hooks**.
2. Rende il markup DOM utilizzando Vite/Tailwind CSS.
3. Si assicurano di non contenere logica business complessa.

---

## 3. Struttura dei Componenti Chiave e Gerarchia Visiva

La struttura segue un pattern *Container/Child* (o presentational logic). L'app radice inietta i Context, il Router passa il "baglio" ai Feature Container, che a loro volta delegano la logica di rendering e fetch agli Hooks e sub-componenti.

```mermaid
flowchart TD
    %% 1. Root & Configuration
    App[App.tsx] --> Providers[Global Providers<br/>(AuthContext, PortfolioContext, FavoritesContext)]
    
    Providers --> AppLayout[App Container / Layout]
    
    %% 2. Router Logic
    AppLayout --> RouterLogic[Router Logic]
    RouterLogic --> Views{Switch View}
    
    %% 3. Feature Containers (UI)
    subgraph MainPages [Pagine Principali - Container]
        Home[HomePage.tsx<br/>Dashboard & Auth UI]
        Search[SearchPage.tsx<br/>ETF List UI]
        Portfolio[PortfolioPage.tsx<br/>Analytics UI]
    end
    
    %% 4. Feature Logic (Hooks)
    subgraph FeatureLogic [Logica Feature - Custom Hooks]
        HomeHook[useHomeLogic]
        SearchHook[useSearchLogic]
        PortHook[usePortfolioLogic]
        HoldHook[useHoldingMainDetails / useHoldingHistory]
    end
    
    %% 5. UI Components (Child)
    subgraph ChildComponents [Componenti UI - Atomici]
        Button[Button]
        Card[Card / Table]
        Chart[PieChartDisplay<br/>EtfCharts]
        Input[SearchBar]
    end
    
    %% 6. Services Layer (Firebase Abstraction)
    subgraph Services [Livello Servizi - Data Abstraction]
        AuthSvc[authService.ts<br/>Login, Signup]
        PortSvc[portfolioService.ts<br/>Get All Holdings]
    end

    %% Connections: Providers -> Hooks & UI
    Providers --> Features[Feature Logic (Hooks)]
    
    %% Connections: Router -> Features
    Views --> Home & Search & Portfolio
    
    %% Connections: Features (UI) -> Child Components
    Home --> Button & Card & Chart
    Search --> Input & Card
    Portfolio --> PortHook & Button & Card
    
    %% Connections: Features (Hooks) -> Services
    HomeHook --> AuthSvc
    SearchHook --> PortSvc
    PortHook --> PortSvc
    HoldHook --> PortSvc
    
    %% Service Connection to Firebase Init
    AppLayout --"Init Config"--> Providers

    %% Styles
    style AppLayout fill:#f0fdf4,stroke:#166534
    style Features fill:#eff6ff,stroke:#2563eb
    style ChildComponents fill:#fff7ed,stroke:#c2410c
    style Services fill:#f3f4f6,stroke:#374151
```

---

## 4. Dettaglio del Flusso di Dati (Data Flow Sequence)

Ecco come un dato scorre dall'inizializzazione al rendering:

1.  **Initialization:** `App.tsx` innesca i `Providers` (Context).
2.  **Service Call:** Un componente UI (es. `PortfolioPage`) monta un suo Hook (`usePortfolioLogic`).
3.  **Hook Execution:** L'Hook chiama il servizio (`portfolioService.getHoldings()`).
4.  **Data Fetching:** Il servizio interroga Firebase e recupera i documenti dal DB.
5.  **State Update:** I dati tornano all'Hook, che li passa al Context Provider per aggiornare lo stato globale (o gestisce lo stato locale se è un dettaglio singolo).
6.  **Render Trigger:** Lo stato aggiornato propaga le nuove props verso il DOM.
7.  **UI Display:** Il Componente UI (es. `Card`) riceve i dati e renderizza il grafico (`PieChartDisplay`).

---

## 5. Mappa del File System Logica

```mermaid
src
├── app/               # Entry Point & Router Configuration
│    ├── App.tsx       # Root Component + Global Providers Injection
│    └── router.tsx   # Navigation Logic (Switch View)
├── shared/           # Shared Business Logic & Utilities
│    ├── config/        # Constants, Firebase Init Setup
│    ├── contexts/      # ContextProviders (Auth, Portfolio, Favorites)
│    ├── services/      # Abstraction: authService, portfolioService (Firebase calls)
│    └── ui/            # Atomic UI Components (Button, Card, Skeleton - Tailwind based)
├── features/         # Feature Modules (Pages & Sub-components)
│    ├── auth/          # Login/Register components
│    ├── home/          # Dashboard Home page logic
│    ├── portfolio/     # Portfolio Overview & Analytics (Chart, Filter)
│    └── holding/       # Detailed view of a single asset (Charts, Financials)
├── assets/           # Static Assets (Background images, etc.)
├── index.css         # Global Tailwind imports / Styles
└── main.tsx          # Entry point for React Rendering
```

---

## 6. Principi di Progetto e Stack

- **Rendering:** React Functional Components con Hooks (`useState`, `useContext`, `useEffect`).
- **Styling:** Tailwind CSS utility classes per il layout, file CSS personalizzati per stili specifici (glassmorphism).
- **Typing:** TypeScript Strict Mode. Nessuna istruzione `any` consentita. Interfacce esplicitate per ogni dato (Portfolio.interface.ts, holding.ts).
- **Grafica:** Librerie esterne per visualizzazioni dati (`Recharts` o equivalenti) per grafici storici e analisi.
- **State Management:** Context API per i dati globali (tutte le holdings di un utente), uso di Hooks locali per dettagli specifici.

## 7. Regole di Implementazione
Quando si scrive nuovo codice:
1. Non mai logica business dentro un `.tsx` UI puro.
2. Creare sempre un Hook (`use*)` prima di implementare il componente che lo usa.
3. Usare i servizi definiti in `shared/services/` per evitare hardcoding Firebase.
4. Mantenere la styling logic separata: CSS file o Tailwind classes.
5. Tipare strettamente ogni interfaccia che attraversa i layer (Service -> Hook -> UI).
