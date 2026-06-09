import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './contexts/AuthContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { SearchProvider } from './contexts/SearchContext'
import { PortfolioProvider } from './contexts/PortfolioContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <FavoritesProvider>
        <SearchProvider>
          <PortfolioProvider>
            <App />
          </PortfolioProvider>
        </SearchProvider>
      </FavoritesProvider>
    </AuthProvider>
  </StrictMode>,
)
