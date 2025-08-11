import { Link } from 'react-router-dom';
import styles from './LoginButton.module.scss';

export interface LoginButtonProps {
  className?: string;
}

export const LoginButton: React.FC<LoginButtonProps> = ({ className = '' }) => {
  return (
    <div className={`d-flex gap-2 ${styles.LoginButton} ${className}`}>
      <Link to="/login" className="btn btn-outline-primary btn-sm">
        로그인
      </Link>
    </div>
  );
};

