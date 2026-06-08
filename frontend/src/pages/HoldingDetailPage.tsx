import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button'; // Assicurati che il path sia corretto in base alle tue cartelle

interface HoldingDetailPageProps {
  isin: string;
  name: string;
  onBack: () => void; // Funzione per tornare indietro
}

export function HoldingDetailPage({ isin, name, onBack }: HoldingDetailPageProps) {
  return (
    <div className="container mx-auto p-4">
      
      {/* Wrapper per distanziare il bottone dalla card sottostante */}
      <div style={{ marginBottom: '1.5rem' }}>
        {/* Usiamo il tuo Button con la variante 'secondary' (grigio ardesia). 
            Se lo vuoi viola come quello principale, ti basta togliere variant="secondary" */}
        <Button onClick={onBack}>
          ← Torna all'Analisi Portafoglio
        </Button>
      </div>

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