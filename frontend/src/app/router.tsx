import App from './App';
import { SearchPage } from '../features/search/SearchPage';
import { PortfolioPage } from '../features/portfolio/PortfolioPage';
import { HoldingDetailPage } from '../features/holding/HoldingDetailPage';
import { HomePage } from '@/features/home/HomePage';
import { Navigate } from 'react-router';
import { TestPage } from '@/features/test/TestPage';

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
        element: <Navigate to="/search"/>,
      },
      {
        element: <HomePage />,
        children: [
          {
            path: '/search',
            element: <SearchPage />,
            handle: { title: 'Ricerca Asset per ISIN' },
          },
          {
            path: '/portfolio',
            element: <PortfolioPage />,
            handle: { title: 'Portfolio' },
          },
        ],
      },
      {
        path: '/holding/:isin',
        element: <HoldingDetailPage />,
        handle: { title: 'Dettaglio Holding' },
      },
      {
        path: '/holding/full/',
        element: <TestPage />,
        handle: { title: 'Global Holding Page' },
      },
    ],
  },
];
