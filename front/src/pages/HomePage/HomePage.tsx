import { Container, Row, Col, Button, Card } from 'react-bootstrap';

export const HomePage: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <Container>
        <Row className="min-vh-50 align-items-center justify-content-center text-center py-5">
          <Col lg={8}>
            <h1 className="display-4 fw-bold mb-4">
              FSD 아키텍처로 구축된
              <br />
              <span className="text-primary">React 애플리케이션</span>
            </h1>

            <p className="lead mb-4 text-body-secondary">
              Feature-Sliced Design 패턴을 적용한 현대적이고 확장 가능한
              프론트엔드 애플리케이션입니다.
            </p>

            <div className="d-flex gap-3 justify-content-center">
              <Button variant="primary" size="lg">
                시작하기
              </Button>
              <Button variant="outline-primary" size="lg">
                더 알아보기
              </Button>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Features Section */}
      <Container className="py-5">
        <Row className="text-center mb-5">
          <Col>
            <h2 className="display-6">주요 특징</h2>
          </Col>
        </Row>

        <Row className="g-4">
          <Col md={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="fs-1 mb-3">📁</div>
                <Card.Title className="h5">체계적인 구조</Card.Title>
                <Card.Text className="text-body-secondary">
                  Feature-Sliced Design으로 논리적이고 확장 가능한 프로젝트 구조
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="fs-1 mb-3">🎨</div>
                <Card.Title className="h5">모던 UI</Card.Title>
                <Card.Text className="text-body-secondary">
                  React Bootstrap을 활용한 아름답고 반응형 사용자 인터페이스
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="fs-1 mb-3">⚡</div>
                <Card.Title className="h5">고성능</Card.Title>
                <Card.Text className="text-body-secondary">
                  React 19, Vite, 그리고 최적화된 번들링으로 빠른 개발과 실행
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="fs-1 mb-3">🔧</div>
                <Card.Title className="h5">개발자 경험</Card.Title>
                <Card.Text className="text-body-secondary">
                  TypeScript, ESLint, 그리고 강력한 개발 도구들
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="bg-dark text-white mt-5 py-4">
        <Container>
          <Row>
            <Col className="text-center">
              <p className="mb-0">&copy; 2024 Vibe. All rights reserved.</p>
            </Col>
          </Row>
        </Container>
      </footer>
    </>
  );
};
