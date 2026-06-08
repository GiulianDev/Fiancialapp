import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { type AggregatedResult } from '../../types/portfolio';
import { Card } from '../ui/Card/Card';
import './EtfCharts.css';
import { PieChartDisplay } from './PieChartDisplay';

const COLORS = [
  '#0066cc',
  '#ff6b6b',
  '#4ecdc4',
  '#45b7d1',
  '#f7b731',
  '#5f27cd',
  '#00d2d3',
  '#ff9ff3',
  '#54a0ff',
  '#48dbfb',
  '#aaa',
];

interface EtfChartsProps {
  combined: AggregatedResult;
}

export function EtfCharts({ combined }: EtfChartsProps) {
  const holdingsData = [
    ...combined.holdings.slice(0, 10),
    ...(combined.residualHolding > 0
      ? [{ nome: 'Altre aziende', peso_percentuale: combined.residualHolding }]
      : []),
  ];

  const countriesData = [
    ...combined.countries.slice(0, 10),
    ...(combined.residualCountry > 0
      ? [{ nome: 'Altri paesi', peso: combined.residualCountry }]
      : []),
  ];

  return (
    <Card className="etf-charts--container">
      <div className="header--container">
        <div className="info--container">
          <h3 className="title">Risultato Aggregato ({combined.count} ETF)</h3>
          <p className="subtitle">
            Visualizza la composizione aggregata delle partecipazioni e l'esposizione geografica del portafoglio preferito.
          </p>
        </div>
      </div>

       <div className="etf-charts__grid">
        {/* Pie Chart per le holdings */}
        <PieChartDisplay
          data={holdingsData}
          dataKey="peso_percentuale"
          nameKey="nome"
          title="Composizione Aziende"
        />

        {/* Pie Chart per i paesi */}
        <PieChartDisplay
          data={countriesData}
          dataKey="peso"
          nameKey="nome"
          title="Esposizione Geografica"
        />
      </div>



    </Card>
  );
}
