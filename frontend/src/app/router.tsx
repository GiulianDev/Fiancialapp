import App from './App';
import { SearchPage } from '../features/search/SearchPage';
import { PortfolioPage } from '../features/portfolio/PortfolioPage';
import { HoldingDetailPage } from '../features/holding/HoldingDetailPage';
import { HomePage } from '@/features/home/HomePage';
import { Navigate } from 'react-router';

/**
 * DEFINIZIONE CENTRALIZZATA DELLE ROUTE
 * 
 * Pattern di layout nidificati:
 * - App = layout principale (header, footer, etc)
 *   - HomePage = layout con tab (solo per search e portfolio)
 *     - SearchPage
 *     - PortfolioPage
 *   - HoldingDetailPage = senza layout/tab
 * 
 * I callback passati alle pagine (es: onHoldingClick) sono gestiti via hook
 * perché il router sa già come navigare. Questo decoupling è pulito.
 */
export const routes = [
  {
    element: <App />,
    path: '/',
    children: [
      {
        index: true,
        element: <Navigate to="/search" replace />,
      },
      {
        element: <HomePage />,
        children: [
          {
            path: '/search',
            element: <SearchPage />,
          },
          {
            path: '/portfolio',
            element: <PortfolioPage />,
          },
        ],
      },
      {
        path: '/holding/:isin',
        element: <HoldingDetailPage />,
      },
    ],
  },
];
