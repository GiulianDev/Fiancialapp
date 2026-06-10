import { useParams, useLocation, useNavigate } from 'react-router';
import { Card } from '../components/ui/Card/Card';

export function HoldingDetailPage() {
  const { isin } = useParams<{ isin: string }>(); // Legge l'ISIN dall'URL
  const location = useLocation();
  const navigate = useNavigate();
  
  // Recupera il nome che avevamo passato tramite lo "state" nella funzione handleHoldingClick
  const name = location.state?.name || 'Dettaglio Holding'; 

  const handleBack = () => {
    // Questo è il VERO tasto indietro: ti riporta alla SearchPage 
    // ripristinando esattamente l'URL precedente (es: /?isin=IE123&hLimit=10)
    navigate(-1); 
  };

  return (
    <div>

      <Card className="p-6">
  
        {/* <button onClick={handleBack}>Torna Indietro</button> */}
  
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