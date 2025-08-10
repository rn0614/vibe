import { useState, type ReactNode } from 'react';
import {
  Container,
  Row,
  Col,
  Navbar,
  Nav,
  Button,
  Dropdown,
  Offcanvas
} from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuthActions, useTheme } from '@/shared/hooks';

export interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, className = '' }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const { user, isLoading, signOutWithRedirect, isSigningOut } = useAuthActions();
  const { theme, effectiveTheme, toggleTheme, setTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = () => {
    signOutWithRedirect('/');
  };

  const navigationItems = [
    { path: '/', label: '홈', icon: '🏠' },
    { path: '/todos', label: '할 일', icon: '✅' },
    { path: '/about', label: '소개', icon: 'ℹ️' },
  ];

  const libraryItems = [
    { path: '/favorites', label: '즐겨찾기', icon: '⭐' },
    { path: '/history', label: '기록', icon: '🕒' },
    { path: '/settings', label: '설정', icon: '⚙️' },
  ];

  return (
          <div className={`d-flex flex-column min-vh-100 bg-body ${className}`}>
        {/* Header */}
        <Navbar bg="body-tertiary" expand="lg" className="border-bottom sticky-top">
        <Container fluid>
          {/* 좌측: 햄버거 메뉴 + 로고 */}
          <div className="d-flex align-items-center">
            <Button 
              variant="outline-secondary" 
              size="sm" 
              className="me-3 border-0"
              onClick={() => setShowSidebar(true)}
            >
              ☰
            </Button>
            <Navbar.Brand as={Link} to="/" className="fw-bold text-primary">
              Vibe
            </Navbar.Brand>
          </div>


          {/* 우측: 테마 토글 + 알림 + 프로필 */}
          <div className="d-flex align-items-center">
            {/* 테마 토글 버튼 (항상 표시) */}
            <Button 
              variant="outline-secondary" 
              size="sm" 
              className="me-2 border-0"
              onClick={toggleTheme}
              title={`현재 테마: ${theme === 'auto' ? `자동 (${effectiveTheme})` : effectiveTheme}`}
            >
              {effectiveTheme === 'dark' ? '🌙' : '☀️'}
            </Button>

            {isLoading ? (
              <div className="text-body-secondary">로딩 중...</div>
            ) : user ? (
              <div className="d-flex align-items-center">
                <Button variant="outline-secondary" size="sm" className="me-2 border-0">
                  🔔
                </Button>
                <Dropdown drop="down" align="end">
                  <Dropdown.Toggle variant="outline-secondary" size="sm" className="border-0">
                    👤
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.ItemText>
                      <small className="text-body-secondary">{user.email}</small>
                    </Dropdown.ItemText>
                    <Dropdown.Divider />
                    
                    {/* 테마 설정 */}
                    <Dropdown.Header>테마 설정</Dropdown.Header>
                    <Dropdown.Item 
                      onClick={() => setTheme('light')}
                      className={theme === 'light' ? 'fw-bold' : ''}
                    >
                      ☀️ 라이트 모드
                    </Dropdown.Item>
                    <Dropdown.Item 
                      onClick={() => setTheme('dark')}
                      className={theme === 'dark' ? 'fw-bold' : ''}
                    >
                      🌙 다크 모드
                    </Dropdown.Item>
                    <Dropdown.Item 
                      onClick={() => setTheme('auto')}
                      className={theme === 'auto' ? 'fw-bold' : ''}
                    >
                      🔄 시스템 설정
                    </Dropdown.Item>
                    
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleSignOut} disabled={isSigningOut}>
                      {isSigningOut ? '로그아웃 중...' : '로그아웃'}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-primary btn-sm">
                  로그인
                </Link>
                <Link to="/signup" className="btn btn-primary btn-sm">
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </Container>
      </Navbar>

      {/* 사이드바 (Offcanvas) */}
      <Offcanvas 
        show={showSidebar} 
        onHide={() => setShowSidebar(false)} 
        placement="start"
        className="bg-body"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>메뉴</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {/* 메인 네비게이션 */}
          <div className="mb-4">
            <Nav className="flex-column">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link d-flex align-items-center py-2 text-decoration-none ${
                    isActive(item.path) ? 'bg-primary text-white rounded' : 'text-body'
                  }`}
                  onClick={() => setShowSidebar(false)}
                >
                  <span className="me-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </Nav>
          </div>

          <hr />

          {/* 라이브러리 섹션 */}
          <div>
            <h6 className="text-muted mb-3">라이브러리</h6>
            <Nav className="flex-column">
              {libraryItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link d-flex align-items-center py-2 text-decoration-none ${
                    isActive(item.path) ? 'bg-primary text-white rounded' : 'text-body'
                  }`}
                  onClick={() => setShowSidebar(false)}
                >
                  <span className="me-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </Nav>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* 메인 컨텐츠 */}
      <div className="flex-grow-1">
        <Container fluid className="py-4">
          <Row>
            <Col>
              {children}
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};
