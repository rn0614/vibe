import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card } from "react-bootstrap";
import { AuthUI } from "@/components/organisms/AuthUI";
import { useAuth } from "@/domains/auth/hooks/useAuth";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 이미 로그인된 사용자는 홈으로 리다이렉트
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  // 로그인된 사용자는 렌더링하지 않음
  if (user) {
    return null;
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center min-vh-75 align-items-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h1 className="h3 fw-bold mb-3">로그인</h1>
                <p className="text-body-secondary">계정에 로그인하여 서비스를 이용하세요</p>
              </div>

              <AuthUI view="sign_in"/>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
