import { useState } from 'react';
import { type EtfData } from '../types/etf';

// 1. URL base fuori dalla funzione o all'inizio
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

export function useEtfSearch() {
  const [isin, setIsin] = useState('IE00BK5BQT80');
  const [dati, setDati] = useState<EtfData | null>(null);
  const [caricando, setCaricando] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [limiteHoldings, setLimiteHoldings] = useState(5);
  const [limiteCountries, setLimiteCountries] = useState(5);

  const cercaEtf = async () => {
    setCaricando(true);
    setErrore(null);
    setLimiteHoldings(5);
    setLimiteCountries(5);

    try {
      const response = await fetch(`${API_URL}/api/v2/etf/${isin}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        setErrore(data.message);
      } else {
        setDati(data);
      }
    } catch (error) {
      setErrore('Errore di connessione al server Python.');
    } finally {
      setCaricando(false);
    }
  };

  return {
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
  };
}
