import { type AggregatedResult } from '../../index';
import { Card } from '../../index';
import './EtfCharts.css';
import { PieChartDisplay } from './PieChartDisplay';

interface EtfChartsProps {
  combined: AggregatedResult;
}

export function EtfCharts({ combined }: EtfChartsProps) {
  // const holdingsData = [
  //   ...combined.holdings.slice(0, 10),
  //   ...(combined.residualHolding > 0
  //     ? [{ nome: 'Altre aziende', peso_percentuale: combined.residualHolding }]
  //     : []),
  // ];

  // const countriesData = [
  //   ...combined.countries.slice(0, 10),
  //   ...(combined.residualCountry > 0
  //     ? [{ nome: 'Altri paesi', peso: combined.residualCountry }]
  //     : []),
  // ];

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
          data={combined.holdings}
          dataKey="peso_percentuale"
          nameKey="nome"
          title="Composizione Aziende"
          maxItems={11}
          residualLabel="Altre aziende"
        />

        {/* Pie Chart per i paesi */}
        <PieChartDisplay
          data={combined.countries}
          dataKey="peso"
          nameKey="nome"
          title="Esposizione Geografica"
          maxItems={11}
          residualLabel="Altri paesi"
        />
      </div>


      <div className="etf-charts__details">
        <div className="etf-charts__section">
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

        <div className="etf-charts__section">
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
