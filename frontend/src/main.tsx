import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './contexts/AuthContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { SearchProvider } from './contexts/SearchContext'
import { PortfolioProvider } from './contexts/PortfolioContext'
// Importo il client di cache
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

// Creo l'istanza del client di cache
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <FavoritesProvider>
        <SearchProvider>
          <PortfolioProvider>
            <App />
          </PortfolioProvider>
        </SearchProvider>
      </FavoritesProvider>
    </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
