import { Nav, Offcanvas } from 'react-bootstrap';
import { NavigationItem } from '@/components/molecules/NavigationItem/NavigationItem';
import styles from './AppSidebar.module.scss';

export interface AppSidebarProps {
  show: boolean;
  onHide: () => void;
  className?: string;
}

export interface NavigationSection {
  title?: string;
  items: {
    path: string;
    label: string;
    icon: string;
  }[];
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ 
  show, 
  onHide, 
  className = '' 
}) => {
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

  const handleItemClick = () => {
    onHide();
  };

  return (
    <Offcanvas 
      show={show} 
      onHide={onHide} 
      placement="start"
      className={`bg-body ${styles.appSidebar} ${className}`}
    >
      <Offcanvas.Header closeButton className={styles.sidebarHeader}>
        <Offcanvas.Title>메뉴</Offcanvas.Title>
      </Offcanvas.Header>
      
      <Offcanvas.Body className={styles.sidebarBody}>
        {/* 메인 네비게이션 */}
        <div className="mb-4">
          <Nav className="flex-column">
            {navigationItems.map((item) => (
              <NavigationItem
                key={item.path}
                path={item.path}
                label={item.label}
                icon={item.icon}
                onClick={handleItemClick}
              />
            ))}
          </Nav>
        </div>

        <hr className={styles.divider} />

        {/* 라이브러리 섹션 */}
        <div>
          <h6 className="text-muted mb-3 px-3">라이브러리</h6>
          <Nav className="flex-column">
            {libraryItems.map((item) => (
              <NavigationItem
                key={item.path}
                path={item.path}
                label={item.label}
                icon={item.icon}
                onClick={handleItemClick}
              />
            ))}
          </Nav>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

