import { Container, Flex } from '@/shared/ui/Layout';
import { Button } from '@/shared/ui/Button';
import { Link, useLocation } from 'react-router-dom';
import { useAuthActions } from '@/shared/hooks/useAuthActions';
import styles from './Header.module.scss';

export const Header: React.FC = () => {
  const location = useLocation();
  const { user, isLoading, signOutWithRedirect, isSigningOut } = useAuthActions();
  
  const isActive = (path: string) => location.pathname === path;
  
  const handleSignOut = () => {
    signOutWithRedirect('/'); // 홈페이지로 리다이렉트 포함
  };
  
  return (
    <header className={styles.header}>
      <Container>
        <Flex justify="between" align="center" className={styles.content}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoText}>Vibe</span>
          </Link>
          
          <nav className={styles.nav}>
            <Link 
              to="/" 
              className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
            >
              홈
            </Link>
            <Link 
              to="/about" 
              className={`${styles.navLink} ${isActive('/about') ? styles.active : ''}`}
            >
              소개
            </Link>
            <Link 
              to="/todos" 
              className={`${styles.navLink} ${isActive('/todos') ? styles.active : ''}`}
            >
              📝 할 일
            </Link>
          </nav>
          
          <div className={styles.actions}>
            {isLoading ? (
              // 로딩 상태
              <div className={styles.loadingActions}>
                <span className={styles.loadingText}>로딩 중...</span>
              </div>
            ) : user ? (
              // 로그인된 상태
              <Flex align="center" gap="sm">
                <span className={styles.welcomeText}>
                  안녕하세요, {user.email}님!
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSignOut}
                  loading={isSigningOut}
                >
                  로그아웃
                </Button>
              </Flex>
            ) : (
              // 로그인되지 않은 상태
              <Flex gap="sm">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    로그인
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">
                    회원가입
                  </Button>
                </Link>
              </Flex>
            )}
          </div>
          
          {/* 모바일 메뉴 버튼 (추후 구현) */}
          <button className={styles.mobileMenuButton}>
            <span className={styles.hamburger}></span>
            <span className={styles.hamburger}></span>
            <span className={styles.hamburger}></span>
          </button>
        </Flex>
      </Container>
    </header>
  );
};
