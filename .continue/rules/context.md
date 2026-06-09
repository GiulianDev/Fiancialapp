---
description: Project-specific rules for Continue agent mode in the Financialapp workspace
---

# Financialapp Project Rules

This workspace is a small full-stack application with two main folders:
- `frontend/`: Vite + React + TypeScript + Tailwind CSS web client
- `backend/`: Python backend API service

Agent mode must use tools to inspect the file tree and read source files, strictly adhering to these rules.

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

## Tech Stack & Architecture Constraints
- **Frontend:** React 18+ (Functional Components & Hooks only), Vite, TypeScript.
- **Backend:** Python (FastAPI) exposing local API endpoints under `http://127.0.0.1:8000/api`.
- **Authentication & Data:** Firebase is used for authentication and tracking user-specific favorites.
- **State Management:** State is managed locally via React Hooks and synchronized with Firebase for user data. Do not introduce Redux, Zustand, or other state libraries.
- **Styling:** Handled **EXCLUSIVELY** via Tailwind CSS. Component-level inline styles (`style={{}}`) are strictly forbidden unless handling strictly dynamic runtime values (e.g., custom animations or pixel calculations from mouse events).

## Coding Guidelines & Code Integrity
- **Strict Typing:** All new frontend code must be strictly typed in TypeScript. Never use `any`.
- **ETF Data Shapes:** Always reference and conform to the existing interfaces in `frontend/src/types/etf.ts`[cite: 1].
- **Component Placement:** Keep new React components under `frontend/src/components/`[cite: 1].
- **API Pattern:** Use the existing fetch URL pattern `http://127.0.0.1:8000/api/etf/{isin}` for ETF data[cite: 1].
- **Code Preservation:** When modifying a file, rewrite only the necessary sections. Keep surrounding business logic intact[cite: 1]. If a change impacts other files, list them in the chat and ask for confirmation first[cite: 1].

## Useful Documentation Links
- React: https://react.dev/
- Vite: https://vite.dev/
- TypeScript: https://www.typescriptlang.org/
- Tailwind CSS: https://tailwindcss.com/docs
- Firebase: https://firebase.google.com/docs
- FastAPI (Python): https://fastapi.tiangolo.com/

## Notes for Agent Mode
- ETF Favorite analysis logic lives in `frontend/src/components/FavoritesPortfolio.tsx`[cite: 1]. Review this file before changing favorite-related code[cite: 1].
- Use the built-in file exploration tools to read adjacent components and file code before making changes[cite: 1].
- Prefer concise, practical changes that fit the current app's architecture and style[cite: 1].