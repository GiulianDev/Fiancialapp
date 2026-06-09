import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './contexts/AuthContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { PortfolioProvider } from './contexts/PortfolioContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <FavoritesProvider>
        <PortfolioProvider>
          <App />
        </PortfolioProvider>
      </FavoritesProvider>
    </AuthProvider>
  </StrictMode>,
)
