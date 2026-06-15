// src/features/portfolio/components/BreakdownSection/BreakdownSection.tsx

import { useMemo } from 'react';
import { PieChartDisplay } from '@/features/portfolio/components/EtfCharts/PieChartDisplay';
import { Button } from '@/shared/ui'; 

interface BreakdownSectionProps {
  title: string;
  subtitle?: string;
  data: Array<Record<string, any>>; // Accetta array di oggetti generici
  dataKey: string;                  // es. 'peso_percentuale' o 'peso'
  nameKey: string;                  // es. 'nome'
  residualLabel?: string;           // es. 'Altre aziende' o 'Altri paesi'
  maxChartItems?: number;           // Quante fette mostrare nel grafico prima di "Altro"
  limiteLista?: number;             // Limite corrente per la visualizzazione testuale/pulsante
  onLoadMore?: () => void;          // Funzione per caricare altri elementi (opzionale)
  onItemClick?: (item: any) => void;// Funzione al click sull'elemento (opzionale)
  isLoading?: boolean;
}

export function BreakdownSection({
  title,
  subtitle,
  data,
  dataKey,
  nameKey,
  residualLabel = 'Altro',
  maxChartItems = 10,
  limiteLista,
  onLoadMore,
  onItemClick,
  isLoading = false,
}: BreakdownSectionProps) {

  // Ordiniamo i dati in modo uniforme in base alla dataKey passata
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => (b[dataKey] || 0) - (a[dataKey] || 0));
  }, [data, dataKey]);

  return (
    <div style={{ flex: '1', minWidth: '200px' }}>
      {isLoading ? (
        // Skeleton unico per il caricamento
        <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
          {[...Array(5)].map((_, i) => (
            <li key={i} className="skeleton" style={{ height: '18px', margin: '6px 0', width: `${80 - i * 8}%` }} />
          ))}
        </ul>
      ) : sortedData.length > 0 ? (
        <>
          {/* Grafico pre-ottimizzato */}
          <PieChartDisplay
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            title={title}
            subtitle={subtitle}
            maxItems={maxChartItems}
            residualLabel={residualLabel}
            onItemClick={onItemClick}
          />

          {/* Se viene passato un limite e una funzione onLoadMore, mostra il pulsante */}
          {limiteLista && onLoadMore && limiteLista < sortedData.length && (
            <Button onClick={onLoadMore}>
              Mostra altri 5 ({sortedData.length - limiteLista} rimanenti)
            </Button>
          )}
        </>
      ) : (
        <p className="text-gray-500 text-sm italic">Nessun dato disponibile per questa sezione.</p>
      )}
    </div>
  );
}