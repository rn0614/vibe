import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from "react-router-dom";

export const NotFoundPage: React.FC = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center min-vh-75 align-items-center text-center">
        <Col xs={12} md={8} lg={6}>
          {/* 에러 코드 */}
          <div className="display-1 fw-bold text-primary mb-4" style={{ fontSize: '8rem' }}>
            404
          </div>

          {/* 제목 */}
          <h1 className="display-6 fw-bold mb-4">
            페이지를 찾을 수 없습니다
          </h1>

          {/* 설명 */}
          <p className="lead text-body-secondary mb-5">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
            <br />
            URL을 다시 확인해주세요.
          </p>

          {/* 액션 버튼들 */}
          <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
            <Link to="/">
              <Button variant="primary" size="lg">
                홈으로 가기
              </Button>
            </Link>
            <Button
              variant="outline-secondary"
              size="lg"
              onClick={() => window.history.back()}
            >
              이전 페이지
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};
