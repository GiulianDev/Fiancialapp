---
description: Project-specific rules for Continue agent mode in the Financialapp workspace
---

# Financialapp Project Rules

This workspace is a small full-stack application with two main folders:

- `frontend/`: Vite + React + TypeScript + Tailwind CSS web client
- `backend/`: Python backend API service

Agent mode should use tools to inspect the file tree and read source files, while using these rules for project-specific context.

## Project Structure

- `frontend/`
  - `src/`: React application source code
  - `src/components/`: main UI components
  - `src/hooks/`: custom React hooks
  - `src/types/`: shared TypeScript types for ETF data
  - `src/firebase.ts`: Firebase configuration and auth helpers
  - `package.json`: frontend dependencies and scripts
  - `vite.config.ts`: Vite configuration
- `backend/`
  - `main.py`: backend API entrypoint that serves ETF data
  - `pyproject.toml`: Python dependencies and project metadata

## What Agent Mode Should Know

- The frontend is a React app built with Vite and TypeScript.
- The backend is Python and exposes local API endpoints under `http://127.0.0.1:8000/api`.
- Favorite ETF analysis is implemented in `frontend/src/components/FavoritesPortfolio.tsx`.
- The app uses Firebase for authentication and user-specific favorites.
- Styling is mostly handled by Tailwind CSS and some component-level inline styles.

## Coding Guidelines

- Prefer TypeScript for new code in `frontend/`.
- Keep new React components under `frontend/src/components/`.
- Use existing `frontend/src/types/etf.ts` for ETF-related data shapes.
- For backend changes, modify `backend/main.py` and keep the API interface compatible with the frontend.
- Do not add dependencies unless they are necessary and consistent with the existing package files.

## Recommended Behavior

- When modifying UI features, work inside `frontend/src/`.
- When adding or changing backend API logic, work inside `backend/`.
- Keep the frontend/backend separation clear.
- Use the existing fetch URL pattern `http://127.0.0.1:8000/api/etf/{isin}` unless updating the API contract intentionally.
- Preserve existing file organization and naming conventions.

## Useful Documentation Links

- React: https://react.dev/
- Vite: https://vitejs.dev/
- TypeScript: https://www.typescriptlang.org/
- Tailwind CSS: https://tailwindcss.com/docs
- Firebase: https://firebase.google.com/docs
- FastAPI (Python): https://fastapi.tiangolo.com/

## Notes for Agent Mode

- Use the built-in file exploration tools to read code before making changes.
- This rule file is the primary project-specific guidance for Continue agent mode.
- If more clarity is needed, inspect `README.md`, `frontend/README.md`, and `backend/README.md`.
- Prefer concise, practical changes that fit the current app's architecture and style.


# Regole di Integrità del Codice e Architettura

## 1. Analisi del Contesto Obbligatoria
- Prima di creare un nuovo componente o modificare una logica esistente, analizza la struttura dei componenti adiacenti tramite la mappa del repository.
- Identifica lo State Management utilizzato (es. Zustand, Redux, Context API) e conformati rigorosamente ad esso. Non introdurre nuovi paradigmi di stato.

## 2. Stile e Standard di Scrittura
- Mantieni rigorosamente l'architettura attuale del progetto (es. se i componenti usano Tailwind, usa Tailwind; se usano CSS Modules, usa CSS Modules).
- Non rimuovere mai funzioni, interfacce TypeScript o commenti esistenti a meno che non sia esplicitamente richiesto per il refactoring.
- Ogni nuovo componente deve essere guidato dai tipi (Strongly Typed). Non usare mai `any`.

## 3. Preservazione del Codice
- Quando modifichi un file, riscrivi solo le sezioni necessarie. Mantieni intatta la logica di business circostante.
- Se una modifica impatta altri file del Workspace, elenca prima i file coinvolti nella chat e chiedi conferma prima di procedere.