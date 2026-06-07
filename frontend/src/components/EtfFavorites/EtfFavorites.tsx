import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { type AggregatedResult } from '../../types/portfolio';
import { Card } from '../ui/Card/Card';
import './EtfFavorites.css';

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

interface EtfFavoritesProps {
  combined: AggregatedResult;
}

export function EtfFavorites({ combined }: EtfFavoritesProps) {
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
    <Card className="etf-favorites--container">
      <div className="header--container">
        <div className="info--container">
          <h3 className="title">Risultato Aggregato ({combined.count} ETF)</h3>
          <p className="subtitle">
            Visualizza la composizione aggregata delle partecipazioni e l'esposizione geografica del portafoglio preferito.
          </p>
        </div>
      </div>

      <div className="etf-favorites__grid">
        <div className="etf-favorites__chart">
          <h4>Composizione Aziende</h4>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={holdingsData}
                dataKey="peso_percentuale"
                nameKey="nome"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ nome, peso_percentuale }) => `${nome.slice(0, 16)}: ${peso_percentuale.toFixed(1)}%`}
              >
                {holdingsData.map((_, index) => (
                  <Cell key={`holding-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${(value as number).toFixed(2)}%`} />
              <Legend wrapperStyle={{ paddingTop: '16px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="etf-favorites__chart">
          <h4>Esposizione Geografica</h4>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={countriesData}
                dataKey="peso"
                nameKey="nome"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ nome, peso }) => `${nome.slice(0, 16)}: ${(peso as number).toFixed(1)}%`}
              >
                {countriesData.map((_, index) => (
                  <Cell key={`country-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${(value as number).toFixed(2)}%`} />
              <Legend wrapperStyle={{ paddingTop: '16px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="etf-favorites__details">
        <div className="etf-favorites__section">
          <h4>Dettagli Aziende</h4>
          <ul>
            {combined.holdings.slice(0, 15).map((holding) => (
              <li key={holding.nome}>
                {holding.nome}: <strong>{holding.peso_percentuale.toFixed(2)}%</strong>
              </li>
            ))}
            {combined.residualHolding > 0 && (
              <li className="residual-row">
                📦 <em>Altre aziende minori</em>: <strong>{combined.residualHolding.toFixed(2)}%</strong>
              </li>
            )}
          </ul>
        </div>

        <div className="etf-favorites__section">
          <h4>Dettagli Paesi</h4>
          <ul>
            {combined.countries.slice(0, 15).map((country) => (
              <li key={country.nome}>
                {country.nome}: <strong>{country.peso.toFixed(2)}%</strong>
              </li>
            ))}
            {combined.residualCountry > 0 && (
              <li className="residual-row">
                🌍 <em>Altri paesi minori</em>: <strong>{combined.residualCountry.toFixed(2)}%</strong>
              </li>
            )}
          </ul>
        </div>
      </div>
    </Card>
  );
}
