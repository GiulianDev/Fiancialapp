# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)



# RUN FRONTEND
  
  npm run dev

  npm run build


# BUILD FOR FIREBASE

  firebase deploy


# Librerie 

- Libreria grafica (non usata)
  https://ui.shadcn.com/

- Libreria per i grafici
  https://recharts.github.io/en-US/guide/



# STRUTTURA FRONT-END
src/
  app/
    App.tsx
    main.tsx
    router.tsx
  features/
    auth/
      AuthButton/
        AuthButton.tsx
    search/
      SearchPage.tsx
      SearchLayout.tsx
      components/
        SearchBar.tsx
        EtfDetails.tsx
        HoldingsSection.tsx
        CountriesSection.tsx
      hooks/
        useEtfSearch.ts
    portfolio/
      PortfolioPage.tsx
      components/
        FavoritesSelector.tsx
        PortfolioAnalysis.tsx
      hooks/
        usePortfolio.ts
    holding/
      HoldingDetailPage.tsx
  shared/
    config/
      constants.ts
      firebase.ts
    ui/
      Button.tsx
      Card.tsx
    context/
      AuthContext.tsx
      FavoritesContext.tsx
      PortfolioContext.tsx
    services/
      authService.ts
      favoriteService.ts
      portfolioService.ts
    types/
      etf.ts
      favorite.ts
      portfolio.ts
    utils/
      portfolioUtils.ts