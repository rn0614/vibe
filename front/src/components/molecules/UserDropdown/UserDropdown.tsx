import { Dropdown } from 'react-bootstrap';
import { IconButton } from '@/components/atoms/IconButton';
import { useTheme } from '@/hooks/useTheme';
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
  const { theme, setTheme } = useTheme();

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
        
        {/* 테마 설정 */}
        <Dropdown.Header>테마 설정</Dropdown.Header>
        <Dropdown.Item 
          onClick={() => setTheme('light')}
          className={theme === 'light' ? 'fw-bold' : ''}
        >
          ☀️ 라이트 모드
        </Dropdown.Item>
        <Dropdown.Item 
          onClick={() => setTheme('dark')}
          className={theme === 'dark' ? 'fw-bold' : ''}
        >
          🌙 다크 모드
        </Dropdown.Item>
        <Dropdown.Item 
          onClick={() => setTheme('auto')}
          className={theme === 'auto' ? 'fw-bold' : ''}
        >
          🔄 시스템 설정
        </Dropdown.Item>
        
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

