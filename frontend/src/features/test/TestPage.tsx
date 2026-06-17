// import { useParams } from 'react-router';
import { useHoldingFull } from './useTest';

export function TestPage() {
  const ISIN: string = "IE00B5BMR087";
  
  // Eseguiamo la fetch dei dati aziendali
  const { data: value } = useHoldingFull(ISIN, '2020-01-01', '2023-01-01 ');

  // Estraiamo in modo sicuro l'array dei dati, di default un array vuoto
  const dati = value?.dati_completi || [];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 flex flex-col box-border p-4">
      
      <div className="text-xl font-bold">ISIN: {ISIN}</div>

      {value && value.status === "success" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Dati Storici: {value.ticker}</h2>
          
          {/* Contenitore per la tabella responsive (scroll orizzontale su schermi piccoli) */}
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Open
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    High
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Low
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Close
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volume
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dati.map((row: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {row.Date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {row.Open.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {row.High.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {row.Low.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right font-semibold">
                      {row.Close.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {row.Volume.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Messaggio se l'array è vuoto */}
            {dati.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                Nessun dato disponibile per il periodo selezionato.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gestione degli errori (Opzionale, utile se "status" è "error") */}
      {value && value.status === "error" && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          {value.message || "Si è verificato un errore nel caricamento dei dati."}
        </div>
      )}
    </div>
  );
}