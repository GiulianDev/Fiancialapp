### Project Structure: src
├── app/
│   ├── App.css
│   ├── App.tsx
│   ├── router.tsx
├── assets/
│   ├── background/
├── features/
│   ├── auth/
│   │   ├── AuthButton/
│   │   │   ├── AuthButton.css
│   │   │   ├── AuthButton.tsx
│   ├── header/
│   │   ├── Header.css
│   │   ├── Header.tsx
│   ├── holding/
│   │   ├── HoldingDetailPage.tsx
│   │   ├── HoldingFinancialDetails/
│   │   │   ├── HoldingFinancialDetails.tsx
│   │   │   ├── HoldingFinancialDetailsProps.ts
│   │   │   ├── useHoldingFinancialDetails.ts
│   │   ├── HoldingHistoryChart/
│   │   │   ├── HoldingHistoryChart.tsx
│   │   │   ├── HoldingHistoryChartProps.ts
│   │   │   ├── useHoldingHistory.ts
│   │   ├── HoldingMainDetails/
│   │   │   ├── HoldingMainDetails.tsx
│   │   │   ├── HoldingMainDetailsProps.ts
│   │   │   ├── useHoldingMainDetails.ts
│   ├── home/
│   │   ├── HomePage.css
│   │   ├── HomePage.tsx
│   ├── portfolio/
│   │   ├── Portfolio.interface.ts
│   │   ├── PortfolioAnalisys/
│   │   │   ├── PortfolioAnalisys.tsx
│   │   │   ├── portfolioUtils.ts
│   │   │   ├── usePortfolioAnalisys.ts
│   │   ├── PortfolioPage.tsx
│   │   ├── components/
│   │   │   ├── EtfCharts/
│   │   │   │   ├── EtfCharts.css
│   │   │   │   ├── EtfCharts.tsx
│   │   │   ├── FavoritesSelector.tsx
│   │   ├── index.ts
│   ├── search/
│   │   ├── EtfDetailTabs/
│   │   │   ├── EtfDetailTabs.css
│   │   │   ├── EtfDetailTabs.tsx
│   │   │   ├── EtfOverviewTab/
│   │   │   │   ├── EtfOverviewChart/
│   │   │   │   │   ├── EtfOverviewChart.interface.ts
│   │   │   │   │   ├── EtfOverviewChart.tsx
│   │   │   │   │   ├── useEtfOverviewChart.tsx
│   │   │   │   ├── EtfOverviewTab.tsx
│   │   │   ├── RiskTab/
│   │   │   │   ├── MetricCard/
│   │   │   │   │   ├── MetricCard.interface.ts
│   │   │   │   │   ├── MetricCard.tsx
│   │   │   │   │   ├── useEtfMetric.tsx
│   │   │   │   ├── RiskTab.tsx
│   │   │   │   ├── RiskTabUtils.tsx
│   │   │   ├── useEtfDetailTabs.ts
│   │   ├── SearchBar/
│   │   │   ├── SearchBar.css
│   │   │   ├── SearchBar.tsx
│   │   ├── SearchPage.tsx
│   ├── test/
│   │   ├── TestPage.tsx
│   │   ├── useTest.ts
├── index.css
├── main.tsx
├── shared/
│   ├── Favorites/
│   │   ├── FavoriteButton/
│   │   │   ├── FavoriteButton.css
│   │   │   ├── FavoriteButton.tsx
│   │   ├── FavoritesContext.tsx
│   │   ├── favorite.ts
│   │   ├── favoriteService.ts
│   │   ├── index.ts
│   ├── config/
│   │   ├── constants.ts
│   │   ├── firebase.ts
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── PortfolioContext.tsx
│   │   ├── index.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── index.ts
│   │   ├── portfolioService.ts
│   ├── types/
│   │   ├── holding.ts
│   │   ├── index.ts
│   │   ├── portfolio.ts
│   ├── ui/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   ├── Card/
│   │   │   ├── Card.tsx
│   │   ├── LoadingText/
│   │   │   ├── Loading.css
│   │   │   ├── Loading.tsx
│   │   ├── PieChartDisplay/
│   │   │   ├── CustomScrollableLegend.tsx
│   │   │   ├── PieChartDisplay.tsx
│   │   ├── Skeleton/
│   │   │   ├── Skeleton.css
│   │   │   ├── Skeleton.tsx
│   │   ├── Tabs/
│   │   │   ├── Tabs.tsx
│   │   ├── index.ts

