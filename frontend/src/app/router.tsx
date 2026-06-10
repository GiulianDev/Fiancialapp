import App from './App';
import { SearchLayout } from '../features/search/searchLayoyt/SearchLayout';
import { SearchPage } from '../features/search/SearchPage';
import { PortfolioPage } from '../features/portfolio/PortfolioPage';
import { HoldingDetailPage } from '../features/holding/HoldingDetailPage';

/**
 * DEFINIZIONE CENTRALIZZATA DELLE ROUTE
 * 
 * Pattern di layout nidificati:
 * - App = layout principale (header, footer, etc)
 *   - SearchLayout = layout con tab (solo per search e portfolio)
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
    children: [
      {
        element: <SearchLayout />,
        children: [
          {
            path: '/',
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
