import { Container, Flex, Button } from '@/shared/ui';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.scss';

export const Header: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
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
          </nav>
          
          <div className={styles.actions}>
            <Button variant="outline" size="sm">
              로그인
            </Button>
            <Button variant="primary" size="sm">
              회원가입
            </Button>
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
