import { FavoritesPortfolio } from '../components/FavoritesPortfolio';
// Importa il nuovo componente per l'analisi del portafoglio (lo creeremo a breve)
import { PortfolioAnalysis } from '../components/PortfolioAnalysis';
import { type Favorite, type FirebaseUser } from '../firebase';


interface PortfolioPageProps {
  user: FirebaseUser | null;
  favorites: Favorite[];
}

export function PortfolioPage({ user, favorites }: PortfolioPageProps) {

  return (
    <div className="container">
      
      <PortfolioAnalysis user={user} favorites={favorites} />
      {/* <FavoritesPortfolio user={user} favorites={favorites} /> */}
    </div>
  );
}
