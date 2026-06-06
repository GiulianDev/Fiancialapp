import { type EtfData, type Country} from '../types/etf';
import { HoldingsSection } from './HoldingsSection';
import { CountriesSection } from './CountriesSection';

interface EtfDetailsProps {
  data: EtfData;
  limiteHoldings: number;
  limiteCountries: number;
  onLoadMoreHoldings: () => void;
  onLoadMoreCountries: () => void;
}

export function EtfDetails({
  data,
  limiteHoldings,
  limiteCountries,
  onLoadMoreHoldings,
  onLoadMoreCountries,
}: EtfDetailsProps) {
  const countriesArray: Country[] = Object.entries(data.countries).map(([nome, peso]) => ({
    nome,
    peso,
  }));

  return (
    <div
      style={{
        textAlign: 'left',
        background: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
      }}
    >
      <h2 style={{ color: '#0066cc', marginTop: 0 }}>{data.nome}</h2>
      <p style={{ margin: '5px 0' }}>
        ISIN: <strong>{data.isin}</strong> | Tipo Asset: <strong>{data.tipo_asset}</strong>
      </p>
      {data.costo_annuo && data.costo_annuo > 0 && (
        <p style={{ margin: '5px 0' }}>
          TER (Costo Annuo): <strong>{data.costo_annuo}%</strong>
        </p>
      )}

      <div style={{ display: 'flex', gap: '50px', marginTop: '30px', flexWrap: 'wrap' }}>
        <HoldingsSection
          holdings={data.holdings}
          totaleHoldings={data.totale_holdings}
          limite={limiteHoldings}
          onLoadMore={onLoadMoreHoldings}
        />

        <CountriesSection
          countries={countriesArray}
          limite={limiteCountries}
          onLoadMore={onLoadMoreCountries}
        />
      </div>
    </div>
  );
}
