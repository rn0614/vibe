import { Layout, Container, Flex, Button } from '@/shared/ui';
import { Header } from '@/shared/ui/Header';
import { Footer } from '@/shared/ui/Footer';
import { Link } from 'react-router-dom';
import styles from './AboutPage.module.scss';

export const AboutPage: React.FC = () => {
  return (
    <Layout>
      <Header />
      
      <main className={styles.main}>
        <Container>
          <div className={styles.content}>
            <h1 className={styles.title}>프로젝트 소개</h1>
            
            <section className={styles.section}>
              <h2>Feature-Sliced Design이란?</h2>
              <p>
                Feature-Sliced Design(FSD)는 프론트엔드 프로젝트를 위한 아키텍처 방법론입니다. 
                이 방법론은 애플리케이션을 여러 계층으로 나누어 코드의 가독성, 유지보수성, 
                그리고 확장성을 크게 향상시킵니다.
              </p>
            </section>
            
            <section className={styles.section}>
              <h2>계층 구조</h2>
              <div className={styles.layerGrid}>
                <div className={styles.layerCard}>
                  <h3>🏗️ App</h3>
                  <p>애플리케이션 초기화, 전역 설정, 라우팅</p>
                </div>
                
                <div className={styles.layerCard}>
                  <h3>📄 Pages</h3>
                  <p>페이지 컴포넌트 (라우트 레벨)</p>
                </div>
                
                <div className={styles.layerCard}>
                  <h3>🧩 Widgets</h3>
                  <p>독립적인 UI 블록 (헤더, 사이드바 등)</p>
                </div>
                
                <div className={styles.layerCard}>
                  <h3>⚡ Features</h3>
                  <p>사용자 상호작용, 비즈니스 로직</p>
                </div>
                
                <div className={styles.layerCard}>
                  <h3>🏢 Entities</h3>
                  <p>비즈니스 엔티티 (사용자, 상품 등)</p>
                </div>
                
                <div className={styles.layerCard}>
                  <h3>🔧 Shared</h3>
                  <p>공유 코드 (UI 컴포넌트, 유틸리티)</p>
                </div>
              </div>
            </section>
            
            <section className={styles.section}>
              <h2>기술 스택</h2>
              <ul className={styles.techList}>
                <li><strong>React 19</strong> - 최신 React 버전</li>
                <li><strong>TypeScript</strong> - 타입 안정성</li>
                <li><strong>Vite</strong> - 빠른 개발 서버</li>
                <li><strong>Sass</strong> - 강력한 CSS 전처리기</li>
                <li><strong>React Router</strong> - 클라이언트 사이드 라우팅</li>
                <li><strong>ESLint</strong> - 코드 품질 관리</li>
              </ul>
            </section>
            
            <Flex justify="center" className={styles.actions}>
              <Link to="/">
                <Button variant="primary" size="lg">
                  홈으로 돌아가기
                </Button>
              </Link>
            </Flex>
          </div>
        </Container>
      </main>
      
      <Footer />
    </Layout>
  );
};
