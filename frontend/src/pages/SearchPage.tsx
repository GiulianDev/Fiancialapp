import { useState } from 'react'; // 1. Importiamo useState per gestire la navigazione interna
import { SearchBar } from '../components/SearchBar/SearchBar';
import { EtfDetails } from '../components/EtfDetails/EtfDetails';
import { HoldingDetailPage } from './HoldingDetailPage'; // 2. Importiamo la pagina di dettaglio
import { type FirebaseUser } from '../firebase';
import { useEtfSearch } from '../hooks/useEtfSearch';
import { useFavorites } from '../hooks/useFavorites';

interface SearchPageProps {
  user: FirebaseUser | null;
}

export function SearchPage({user}: SearchPageProps) {

  // Stato locale per memorizzare la holding cliccata (inizialmente null)
  const [selectedHolding, setSelectedHolding] = useState<{ isin: string; name: string } | null>(null);

  const {
    isin,
    setIsin,
    cercaEtf,
    caricando,
    errore,
    dati,
    limiteHoldings,
    setLimiteHoldings,
    limiteCountries,
    setLimiteCountries,
  } = useEtfSearch();

  const { favoriteIsins, toggleFavorite } = useFavorites(user);

  // Se lo stato "selectedHolding" contiene dati, mostriamo HoldingDetailPage
  if (selectedHolding) {
    return (
      <HoldingDetailPage
        isin={selectedHolding.isin}
        name={selectedHolding.name}
        onBack={() => setSelectedHolding(null)} // Quando clicca "Indietro", azzeriamo lo stato per tornare alla ricerca
      />
    );
  }

  // Se "selectedHolding" è null, mostriamo la normale pagina di ricerca ed EtfDetails
  return (
    <>
      <SearchBar isin={isin} onIsinChange={setIsin} onSearch={cercaEtf} isLoading={caricando} />

      {errore && <p style={{ color: 'red', fontWeight: 'bold' }}>{errore}</p>}

      {dati && dati.status === 'success' && (
        <EtfDetails
          data={dati}
          limiteHoldings={limiteHoldings}
          limiteCountries={limiteCountries}
          onLoadMoreHoldings={() => setLimiteHoldings((prev) => prev + 5)}
          onLoadMoreCountries={() => setLimiteCountries((prev) => prev + 5)}
          isFavorite={favoriteIsins.has(isin)}
          onToggleFavorite={() => toggleFavorite(isin, dati.nome)}
          user={user}
          onHoldingClick={(holdingIsin, holdingName) => {
            setSelectedHolding({ isin: holdingIsin, name: holdingName });
          }}
        />
      )}
    </>
  );
}