import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router'
import { AuthProvider } from './shared/contexts/AuthContext'
import { FavoritesProvider } from './shared/contexts/FavoritesContext'
import { PortfolioProvider } from './shared/contexts/PortfolioContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routes } from './app/router'
import './index.css'

const queryClient = new QueryClient();

// Creiamo il router con le route centralizzate
const router = createBrowserRouter(routes);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
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