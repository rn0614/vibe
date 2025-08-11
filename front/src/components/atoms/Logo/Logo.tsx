import { Link } from 'react-router-dom';
import { Navbar } from 'react-bootstrap';
import styles from './Logo.module.scss';

export interface LogoProps {
  to?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  to = '/', 
  className = '' 
}) => {
  return (
    <Navbar.Brand 
      as={Link} 
      to={to} 
      className={`fw-bold text-primary ${styles.logo} ${className}`}
    >
      Vibe
    </Navbar.Brand>
  );
};

