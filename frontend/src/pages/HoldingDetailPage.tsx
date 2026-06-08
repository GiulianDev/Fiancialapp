import { Card } from '../components/ui/Card/Card';

interface HoldingDetailPageProps {
  isin: string;
  name: string;
  onBack: () => void; // Funzione per tornare indietro
}

export function HoldingDetailPage({ isin, name, onBack }: HoldingDetailPageProps) {
  return (
    <div className="container mx-auto p-4">
      <button
        onClick={onBack}
        className="mb-6 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
      >
        ← Torna all'Analisi Portafoglio
      </button>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Dettagli Holding</h2>
        <p className="text-lg"><strong>Nome:</strong> {name}</p>
        <p className="text-lg"><strong>ISIN:</strong> {isin}</p>
        {/* Qui in futuro si potranno aggiungere ulteriori dettagli recuperati via API */}
        <p className="text-gray-500 mt-4">
          In futuro, qui verranno mostrati dati aggiuntivi sulla singola holding recuperati tramite API.
        </p>
      </Card>
    </div>
  );
}