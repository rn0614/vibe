import { useState, type ReactNode } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { AppSidebar } from '@/components/organisms/AppSidebar';
import { AppHeader } from '@/components/organisms/AppHeader';
import styles from './MainLayout.module.scss';

export interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  className = '' 
}) => {
  const [showSidebar, setShowSidebar] = useState(false);

  const handleMenuToggle = () => {
    setShowSidebar(true);
  };

  const handleSidebarHide = () => {
    setShowSidebar(false);
  };

  return (
    <div className={`d-flex flex-column min-vh-100 bg-body ${styles.mainLayout} ${className}`}>
      {/* Header */}
      <AppHeader onMenuToggle={handleMenuToggle} />

      {/* Sidebar */}
      <AppSidebar 
        show={showSidebar} 
        onHide={handleSidebarHide} 
      />

      {/* Main Content */}
      <main className={`flex-grow-1 ${styles.mainContent}`}>
        <Container fluid className="py-4">
          <Row>
            <Col>
              {children}
            </Col>
          </Row>
        </Container>
      </main>
    </div>
  );
};

