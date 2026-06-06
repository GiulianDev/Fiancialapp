import './App.css';
import { SearchBar } from './components/SearchBar';
import { EtfDetails } from './components/EtfDetails/EtfDetails';
import { AuthButton } from './components/AuthButton/AuthButton';
import { useEtfSearch } from './hooks/useEtfSearch';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import { useFavorites } from './hooks/useFavorites';

function App() {
  const {
    isin,
    setIsin,
    dati,
    caricando,
    errore,
    limiteHoldings,
    setLimiteHoldings,
    limiteCountries,
    setLimiteCountries,
    cercaEtf,
  } = useEtfSearch();

  const { user, authLoading, signIn, signOut } = useFirebaseAuth();
  const { favorites, favoriteIsins, loading: favoritesLoading, error: favoritesError, toggleFavorite } = useFavorites(user);

  return (
    <div id="container">

      <AuthButton user={user} authLoading={authLoading} signIn={signIn} signOut={signOut} />  
      
      <div className="title-container">
        <h1>Ricerca Asset per ISIN</h1>
      </div>

      <div className="serchabar-container">
        <SearchBar isin={isin} onIsinChange={setIsin} onSearch={cercaEtf} isLoading={caricando} />
      </div>

      {user ? (
        <div className="favorites-panel">
          <h2>Preferiti</h2>
          {favoritesLoading ? (
            <p>Caricamento preferiti...</p>
          ) : favoritesError ? (
            <p className="favorites-error">{favoritesError}</p>
          ) : favorites.length === 0 ? (
            <p className="favorites-note">Non hai ancora preferiti.</p>
          ) : (
            <ul className="favorites-list">
              {favorites.map((favorite) => (
                <li key={favorite.id ?? favorite.isin}>
                  {favorite.name ? `${favorite.name} - ` : ''}
                  <strong>{favorite.isin}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="favorites-note">Accedi per salvare e vedere i tuoi preferiti.</p>
      )}

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
        />
      )}
    </div>
  );
}

export default App;