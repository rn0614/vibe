import { Button } from 'react-bootstrap';
import styles from './IconButton.module.scss';

export interface IconButtonProps {
  icon: string;
  onClick?: () => void;
  variant?: 'outline-secondary' | 'outline-primary' | 'primary' | 'secondary';
  size?: 'sm' | 'lg';
  className?: string;
  title?: string;
  disabled?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  variant = 'outline-secondary',
  size = 'sm',
  className = '',
  title,
  disabled = false
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      className={`border-0 ${styles.iconButton} ${className}`}
      onClick={onClick}
      title={title}
      disabled={disabled}
    >
      {icon}
    </Button>
  );
};

