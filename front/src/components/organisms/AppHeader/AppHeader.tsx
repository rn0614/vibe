import { Container, Navbar } from 'react-bootstrap';
import { ThemeToggle } from '@/components/molecules/ThemeToggle';
import { LoginButton } from '@/components/molecules/AuthActions/LoginButton';
import { UserDropdown } from '@/components/molecules/UserDropdown/UserDropdown';
import { useAuthActions } from '@/domains/auth/hooks/useAuthActions';
import styles from './AppHeader.module.scss';
import { BrandSection  } from '@/components/molecules/BrandSection/BrandSection';
import { IconButton } from '@/components/atoms/IconButton';

export interface AppHeaderProps {
  onMenuToggle: () => void;
  className?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  onMenuToggle, 
  className = '' 
}) => {
  const { user, isLoading, signOutWithRedirect, isSigningOut } = useAuthActions();

  const handleSignOut = () => {
    signOutWithRedirect('/');
  };

  return (
    <Navbar 
      bg="body-tertiary" 
      expand="lg" 
      className={`border-bottom sticky-top ${styles.appHeader} ${className}`}
    >
      <Container fluid>
        {/* 좌측: 햄버거 메뉴 + 로고 */}
        <BrandSection onMenuToggle={onMenuToggle} />

        {/* 우측: 테마 토글 + 인증 관련 */}
        <div className="d-flex align-items-center">
          <ThemeToggle className="me-2" />

          {isLoading ? (
            <div className="text-body-secondary">로딩 중...</div>
          ) : user ? (
            <div className="d-flex align-items-center">
              <IconButton
                icon="🔔"
                className="me-2"
                title="알림"
              />
              <UserDropdown
                userEmail={user.email}
                onSignOut={handleSignOut}
                isSigningOut={isSigningOut}
              />
            </div>
          ) : (
            <LoginButton />
          )}
        </div>
      </Container>
    </Navbar>
  );
};

