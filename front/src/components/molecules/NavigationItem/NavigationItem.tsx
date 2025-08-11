import { Link, useLocation } from 'react-router-dom';
import styles from './NavigationItem.module.scss';

export interface NavigationItemProps {
  path: string;
  label: string;
  icon: string;
  onClick?: () => void;
  className?: string;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  path,
  label,
  icon,
  onClick,
  className = ''
}) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Link
      to={path}
      className={`nav-link d-flex align-items-center py-2 text-decoration-none ${
        isActive ? 'bg-primary text-white rounded' : 'text-body'
      } ${styles.navigationItem} ${className}`}
      onClick={onClick}
    >
      <span className="me-3">{icon}</span>
      {label}
    </Link>
  );
};

