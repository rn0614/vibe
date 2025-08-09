import { Layout, Container, Flex, Button } from '@/shared/ui';
import { Header } from '@/widgets/Header';
import { Footer } from '@/widgets/Footer';
import styles from './HomePage.module.scss';

export const HomePage: React.FC = () => {
  return (
    <Layout>
      <Header />
      
      <main className={styles.main}>
        <Container>
          <Flex direction="column" align="center" justify="center" className={styles.hero}>
            <h1 className={styles.title}>
              FSD 아키텍처로 구축된<br />
              <span className={styles.highlight}>React 애플리케이션</span>
            </h1>
            
            <p className={styles.description}>
              Feature-Sliced Design 패턴을 적용한 현대적이고 확장 가능한 프론트엔드 애플리케이션입니다.
            </p>
            
            <Flex gap="md" className={styles.actions}>
              <Button variant="primary" size="lg">
                시작하기
              </Button>
              <Button variant="outline" size="lg">
                더 알아보기
              </Button>
            </Flex>
          </Flex>
          
          <section className={styles.features}>
            <h2 className={styles.sectionTitle}>주요 특징</h2>
            
            <div className={styles.featureGrid}>
              <div className={styles.featureCard}>
                <h3>📁 체계적인 구조</h3>
                <p>Feature-Sliced Design으로 논리적이고 확장 가능한 프로젝트 구조</p>
              </div>
              
              <div className={styles.featureCard}>
                <h3>🎨 모던 UI</h3>
                <p>Sass와 CSS Modules을 활용한 재사용 가능한 컴포넌트 시스템</p>
              </div>
              
              <div className={styles.featureCard}>
                <h3>⚡ 고성능</h3>
                <p>React 19, Vite, 그리고 최적화된 번들링으로 빠른 개발과 실행</p>
              </div>
              
              <div className={styles.featureCard}>
                <h3>🔧 개발자 경험</h3>
                <p>TypeScript, ESLint, 그리고 강력한 개발 도구들</p>
              </div>
            </div>
          </section>
        </Container>
      </main>
      
      <Footer />
    </Layout>
  );
};
