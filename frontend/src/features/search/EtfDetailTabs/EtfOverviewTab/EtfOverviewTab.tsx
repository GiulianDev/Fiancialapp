import { motion } from "framer-motion";
import { EtfOverviewChart } from "./EtfOverviewChart/EtfOverviewChart";
import { useNavigate } from "react-router";

interface OverviewTabProps {
  isin: string;
}

export function EtfOverviewTab({ isin }: OverviewTabProps) {
  
  const navigate = useNavigate();

  const handleHoldingClick = (isinToNavigate: string, name: string) => {
    if (!isinToNavigate) return;
    navigate(`/holding/${isinToNavigate}`, { state: { name } });
  };

  return (
    <>
      
      <EtfOverviewChart isin={isin} etfOverviewChartType="holdings" title="Top Partecipazioni" onItemClick={(item) => handleHoldingClick(item.isin, item.nome)}/>

      <EtfOverviewChart isin={isin} etfOverviewChartType="regions" title="Esposizione regionale"/>

      <EtfOverviewChart isin={isin} etfOverviewChartType="sectors" title="Esposizione settoriale"/>

      <EtfOverviewChart isin={isin} etfOverviewChartType="countries" title="Esposizione geografica"/>

    </>
  );
}