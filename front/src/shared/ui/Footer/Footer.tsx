import { Container, Flex, Grid } from '@/shared/ui/Layout';
import { Link } from 'react-router-dom';
import styles from './Footer.module.scss';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.content}>
          <Grid cols={4} gap="lg" className={styles.grid}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Vibe</h3>
              <p className={styles.description}>
                Feature-Sliced Design 패턴을 적용한 현대적이고 확장 가능한 React 애플리케이션입니다.
              </p>
            </div>
            
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>페이지</h4>
              <ul className={styles.linkList}>
                <li>
                  <Link to="/" className={styles.link}>홈</Link>
                </li>
                <li>
                  <Link to="/about" className={styles.link}>소개</Link>
                </li>
              </ul>
            </div>
            
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>기술</h4>
              <ul className={styles.linkList}>
                <li>
                  <a 
                    href="https://react.dev" 
                    className={styles.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    React
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.typescriptlang.org" 
                    className={styles.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    TypeScript
                  </a>
                </li>
                <li>
                  <a 
                    href="https://vitejs.dev" 
                    className={styles.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Vite
                  </a>
                </li>
                <li>
                  <a 
                    href="https://sass-lang.com" 
                    className={styles.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Sass
                  </a>
                </li>
              </ul>
            </div>
            
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>리소스</h4>
              <ul className={styles.linkList}>
                <li>
                  <a 
                    href="https://feature-sliced.design" 
                    className={styles.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    FSD 공식 문서
                  </a>
                </li>
                <li>
                  <a 
                    href="https://github.com" 
                    className={styles.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </Grid>
          
          <div className={styles.bottom}>
            <Flex justify="between" align="center" className={styles.bottomContent}>
              <p className={styles.copyright}>
                © {currentYear} Vibe. All rights reserved.
              </p>
              
              <div className={styles.social}>
                <p className={styles.socialText}>
                  Built with Feature-Sliced Design
                </p>
              </div>
            </Flex>
          </div>
        </div>
      </Container>
    </footer>
  );
};
