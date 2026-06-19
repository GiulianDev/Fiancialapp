---
description: Project-specific architectural constraints for Financialapp
---

# Financialapp Core Rules

Sei l'Agente AI di Financialapp (Frontend React/TS + Backend Python FastAPI). 
Non inventare la struttura delle cartelle: è mappata dinamicamente.

## 1. Architettura & Accesso al Contesto (IMPORTANTE)
- **Mappa del Progetto:** La struttura reale dei file, i nodi e le dipendenze cambiano continuamente e sono registrati nel file `graphify-out/GRAPH_REPORT.md`.
- **Documentazione di Business:** Il progetto contiene file `.md` sparsi nelle cartelle che descrivono le regole del dominio finanziario e dei moduli.
- **Regola d'oro:** Prima di scrivere o modificare qualsiasi codice, devi obbligatoriamente leggere `graphify-out/GRAPH_REPORT.md` E i file `.md` di modulo pertinenti alla richiesta, usando i tuoi tool di esplorazione o la ricerca semantica. Basati su di essi per sapere cosa modificare.

## 2. Vincoli di Stack Tecnologico
- **Frontend:** React 18+ (Solo Componenti Funzionali e Hook), Vite, TypeScript.
- **Backend:** Python (FastAPI) con endpoint locali sotto `http://127.0.0.1:8000/api`.
- **Stato & Auth:** Firebase gestisce l'autenticazione e i preferiti. Non introdurre Redux, Zustand o altre librerie di stato.
- **Styling:** Esclusivamente Tailwind CSS. Vietati gli stili inline (`style={{}}`), a meno che non siano calcoli dinamici a runtime (es. coordinate del mouse).

## 3. Linee Guida di Codifica
- **Tipizzazione Rigida:** Tutto il codice TypeScript deve essere fortemente tipizzato. Vietato l'uso di `any`.
- **Dati ETF:** Conformati sempre alle interfacce definite in `frontend/src/types/etf.ts`.
- **Integrità del Codice:** Quando modifichi un file, riscrivi solo le sezioni necessarie mantenendo intatta la logica di business circostante.

## 4. Flusso di Ragionamento (Reasoning UI)
- **Obbligo di Pensiero:** Prima di eseguire qualsiasi azione, modificare file o chiamare i tuoi strumenti (tool), devi obbligatoriamente avviare una fase di pianificazione logica racchiusa tassativamente tra i tag `<think>` e `</think>`.
- **Contenuto del Pensiero:** Dentro il tag `<think>`, scrivi in italiano cosa stai pianificando di fare, indicando esplicitamente come stai usando il file `graphify-out/GRAPH_REPORT.md` e quali file `.md` di modulo stai leggendo per orientarti.
- **Risposta finale:** Una volta chiuso il tag `</think>`, procedi con l'uso dei tool o con la risposta testuale pulita.