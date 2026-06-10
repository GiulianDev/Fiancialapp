import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 1. IMPORTIAMO IL BROWSER ROUTER
import { BrowserRouter } from 'react-router'
import { AuthProvider } from './contexts/AuthContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
// Il SearchProvider l'abbiamo eliminato, ottimo!
import { PortfolioProvider } from './contexts/PortfolioContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 2. AVVOLGIAMO L'INTERA APP NEL BROWSER ROUTER */}
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <FavoritesProvider>
            <PortfolioProvider>
              <App />
            </PortfolioProvider>
          </FavoritesProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)