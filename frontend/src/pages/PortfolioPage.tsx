import { FavoritesPortfolio } from '../components/FavoritesPortfolio';
import { type Favorite, type FirebaseUser } from '../firebase';

interface PortfolioPageProps {
  user: FirebaseUser | null;
  favorites: Favorite[];
}

export function PortfolioPage({ user, favorites }: PortfolioPageProps) {
  return <FavoritesPortfolio user={user} favorites={favorites} />;
}
