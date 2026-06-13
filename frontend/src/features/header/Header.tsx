import { AuthButton } from '../auth/AuthButton/AuthButton';
import './Header.css';

export function Header() {
  return (
   
  <div className='header'>
    {/* HEADER - SEMPRE VISIBILE */}
    <AuthButton />
    <div className="title">
      <h1>Ricerca Asset per ISIN</h1>
    </div>
  </div>
     
  );
}