import App from './App';
import { SearchLayout } from './layouts/SearchLayout';
import { SearchPage } from './pages/SearchPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { HoldingDetailPage } from './pages/HoldingDetailPage';

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
