import { Container, Row, Col, Card, Button, ListGroup } from 'react-bootstrap';
import { Link } from "react-router-dom";

export const AboutPage: React.FC = () => {
  const layers = [
    {
      icon: '🏗️',
      title: 'App',
      description: '애플리케이션 초기화, 전역 설정, 라우팅'
    },
    {
      icon: '📄',
      title: 'Pages',
      description: '페이지 컴포넌트 (라우트 레벨)'
    },
    {
      icon: '🧩',
      title: 'Widgets',
      description: '독립적인 UI 블록 (헤더, 사이드바 등)'
    },
    {
      icon: '⚡',
      title: 'Features',
      description: '사용자 상호작용, 비즈니스 로직'
    },
    {
      icon: '🏢',
      title: 'Entities',
      description: '비즈니스 엔티티 (사용자, 상품 등)'
    },
    {
      icon: '🔧',
      title: 'Shared',
      description: '공유 코드 (UI 컴포넌트, 유틸리티)'
    }
  ];

  const techStack = [
    { name: 'React 19', description: '최신 React 버전' },
    { name: 'TypeScript', description: '타입 안정성' },
    { name: 'Vite', description: '빠른 개발 서버' },
    { name: 'React Bootstrap', description: '아름다운 UI 컴포넌트' },
    { name: 'React Router', description: '클라이언트 사이드 라우팅' },
    { name: 'ESLint', description: '코드 품질 관리' }
  ];

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={10} xl={8}>
          {/* 제목 섹션 */}
          <div className="text-center mb-5">
            <h1 className="display-5 fw-bold mb-4">프로젝트 소개</h1>
          </div>

          {/* FSD 소개 */}
          <Card className="mb-5 border-0 shadow-sm">
            <Card.Body className="p-4">
              <h2 className="h4 fw-bold mb-3">Feature-Sliced Design이란?</h2>
              <p className="text-body-secondary mb-0">
                Feature-Sliced Design(FSD)는 프론트엔드 프로젝트를 위한 아키텍처
                방법론입니다. 이 방법론은 애플리케이션을 여러 계층으로 나누어
                코드의 가독성, 유지보수성, 그리고 확장성을 크게 향상시킵니다.
              </p>
            </Card.Body>
          </Card>

          {/* 계층 구조 */}
          <Card className="mb-5 border-0 shadow-sm">
            <Card.Body className="p-4">
              <h2 className="h4 fw-bold mb-4">계층 구조</h2>
              <Row className="g-3">
                {layers.map((layer, index) => (
                  <Col md={6} lg={4} key={index}>
                    <Card className="h-100 border border-light">
                      <Card.Body className="text-center p-3">
                        <div className="fs-1 mb-2">{layer.icon}</div>
                        <Card.Title className="h6 fw-bold">{layer.title}</Card.Title>
                        <Card.Text className="text-body-secondary small mb-0">
                          {layer.description}
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>

          {/* 기술 스택 */}
          <Card className="mb-5 border-0 shadow-sm">
            <Card.Body className="p-4">
              <h2 className="h4 fw-bold mb-4">기술 스택</h2>
              <ListGroup variant="flush">
                {techStack.map((tech, index) => (
                  <ListGroup.Item key={index} className="d-flex align-items-center py-3 border-0">
                    <div className="me-3">
                      <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" 
                           style={{ width: '8px', height: '8px' }}>
                      </div>
                    </div>
                    <div>
                      <div className="fw-semibold">{tech.name}</div>
                      <small className="text-body-secondary">{tech.description}</small>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>

          {/* 액션 버튼 */}
          <div className="text-center">
            <Link to="/">
              <Button variant="primary" size="lg">
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};
