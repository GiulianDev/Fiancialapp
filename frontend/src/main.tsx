import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router'
import { AuthProvider } from './shared/contexts/AuthContext'
import { FavoritesProvider } from '@shared/Favorites'
import { PortfolioProvider } from './shared/contexts/PortfolioContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routes } from './app/router'
import './index.css'

// React Query client condiviso per tutta l'app,
// gestisce cache, fetch e invalidazione automatica.
const queryClient = new QueryClient();

// Creiamo il router con le route centralizzate
const router = createBrowserRouter(routes);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {/*
        Stack dei provider globali:
        - AuthProvider: stato di login dell'utente
        - FavoritesProvider: dati dei preferiti sincronizzati con Firestore
        - PortfolioProvider: dati del portafoglio salvato
        Questo livello alto permette ai componenti di tutta l'app di accedere facilmente
        a user, favorites e portfolio senza passare props troppo in profondità.
      */}
      <AuthProvider>
        <FavoritesProvider>
          <PortfolioProvider>
            {/* RouterProvider gestisce tutte le route e la navigazione */}
            <RouterProvider router={router} />
          </PortfolioProvider>
        </FavoritesProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)