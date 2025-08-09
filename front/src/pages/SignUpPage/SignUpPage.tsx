import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Container, Flex } from '@/shared/ui';
import { AuthUI } from '@/features/auth';
import { Header } from '@/shared/ui/Header';
import { Footer } from '@/shared/ui/Footer';
import { useAuth } from '@/shared/hooks';
import styles from './SignUpPage.module.scss';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 이미 로그인된 사용자는 홈으로 리다이렉트
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // 로그인된 사용자는 렌더링하지 않음
  if (user) {
    return null;
  }

  return (
    <Layout>
      <Header />
      
      <main className={styles.main}>
        <Container size="sm">
          <Flex 
            direction="column" 
            align="center" 
            justify="center" 
            className={styles.content}
          >
            <div className={styles.header}>
              <h1 className={styles.title}>회원가입</h1>
              <p className={styles.subtitle}>
                새 계정을 만들어 서비스를 시작하세요
              </p>
            </div>
            
            <AuthUI 
              view="sign_up"
              className={styles.authForm}
              redirectTo={window.location.origin}
            />
          </Flex>
        </Container>
      </main>
      
      <Footer />
    </Layout>
  );
};
