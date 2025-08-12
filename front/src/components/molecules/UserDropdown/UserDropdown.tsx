import { Dropdown } from 'react-bootstrap';
import { IconButton } from '@/components/atoms/IconButton';
import styles from './UserDropdown.module.scss';

export interface UserDropdownProps {
  userEmail?: string;
  onSignOut: () => void;
  isSigningOut?: boolean;
  className?: string;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  userEmail,
  onSignOut,
  isSigningOut = false,
  className = ''
}) => {
  return (
    <Dropdown drop="down" align="end" className={className}>
      <Dropdown.Toggle 
        as={IconButton}
        icon="👤"
        className={styles.dropdownToggle}
      />
      <Dropdown.Menu className={styles.dropdownMenu}>
        <Dropdown.ItemText>
          <small className="text-body-secondary">{userEmail}</small>
        </Dropdown.ItemText>    
        <Dropdown.Divider />
        <Dropdown.Item 
          onClick={onSignOut} 
          disabled={isSigningOut}
          className={styles.signOutItem}
        >
          {isSigningOut ? '로그아웃 중...' : '로그아웃'}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

