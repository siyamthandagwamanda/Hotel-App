import { Link } from 'react-router-dom';
import Logo from './Logo';
import AccountMenu from './AccountMenu';
import '../../styles/PageHeader.css';

export function PageHeader() {
  return (
    <header className="page-header">
      <Link to="/" className="page-header-logo" aria-label="StayHop home">
        <Logo />
      </Link>
      <nav className="page-header-nav">
        <Link to="/trips" className="page-header-link">My trips</Link>
        <AccountMenu />
      </nav>
    </header>
  );
}

export default PageHeader;