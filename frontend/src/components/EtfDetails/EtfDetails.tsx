import { type EtfData, type Country } from '../../types/etf';
import { HoldingsSection } from '../HoldingsSection';
import { CountriesSection } from '../CountriesSection';
import './EtfDetails.css';

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
    <div className="etf-details">
      <h2 className="etf-details__title">{data.nome}</h2>
      <p className="etf-details__meta">
        ISIN: <strong>{data.isin}</strong> | Tipo Asset: <strong>{data.tipo_asset}</strong>
      </p>
      {data.costo_annuo && data.costo_annuo > 0 && (
        <p className="etf-details__meta">
          TER (Costo Annuo): <strong>{data.costo_annuo}%</strong>
        </p>
      )}

      <div className="etf-details__grid">
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
