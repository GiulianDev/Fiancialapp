import { useQuery } from '@tanstack/react-query';
import { type EtfData } from '../types/etf';
import { API_URL } from '../constants';

export function useEtfSearch(isin: string) {
  return useQuery({
    // La chiave univoca per la cache: se l'isin cambia, React Query sa se pescarlo in memoria o dal server
    queryKey: ['etf', isin], 
    
    queryFn: async (): Promise<EtfData> => {
      const response = await fetch(`${API_URL}/api/v2/etf/${isin}`);
      const data = await response.json();
      
      // Gestiamo l'errore sollevando un'eccezione che React Query catturerà automaticamente
      if (data.status === 'error') {
        throw new Error(data.message || 'Errore di connessione al server Python.');
      } 
      
      return data;
    },
    
    // Configurazione da Senior:
    staleTime: 1000 * 60 * 5, // I dati rimangono "freschi" in cache per 5 minuti
    enabled: isin.length >= 10, // Evitiamo che faccia chiamate a vuoto se l'ISIN è troppo corto
  });
}