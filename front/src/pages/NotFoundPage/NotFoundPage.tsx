import { Layout, Container, Flex } from "@/shared/ui/Layout";
import { Button } from "@/shared/ui/Button";
import { Header } from "@/shared/ui/Header";
import { Footer } from "@/shared/ui/Footer";
import { Link } from "react-router-dom";
import styles from "./NotFoundPage.module.scss";

export const NotFoundPage: React.FC = () => {
  return (
    <Layout>
      <Header />

      <main className={styles.main}>
        <Container>
          <Flex
            direction="column"
            align="center"
            justify="center"
            className={styles.content}
          >
            <div className={styles.errorCode}>404</div>

            <h1 className={styles.title}>페이지를 찾을 수 없습니다</h1>

            <p className={styles.description}>
              요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
              <br />
              URL을 다시 확인해주세요.
            </p>

            <Flex gap="md" className={styles.actions}>
              <Link to="/">
                <Button variant="primary" size="lg">
                  홈으로 가기
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.history.back()}
              >
                이전 페이지
              </Button>
            </Flex>
          </Flex>
        </Container>
      </main>

      <Footer />
    </Layout>
  );
};
