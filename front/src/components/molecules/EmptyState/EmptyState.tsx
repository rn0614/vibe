import React from 'react';
import { Card, Button } from 'react-bootstrap';

export interface EmptyStateProps {
  /** 표시할 아이콘 (이모지 또는 아이콘 컴포넌트) */
  icon?: React.ReactNode;
  /** 제목 */
  title: string;
  /** 설명 텍스트 */
  description?: string;
  /** 액션 버튼 */
  action?: {
    label: string;
    onClick: () => void;
    variant?: string;
    disabled?: boolean;
  };
  /** 카드 스타일 적용 여부 */
  withCard?: boolean;
  /** 추가 클래스명 */
  className?: string;
  /** 아이콘 크기 */
  iconSize?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * 빈 상태를 표시하는 공용 컴포넌트
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   icon="📝"
 *   title="할 일이 없습니다"
 *   description="첫 번째 할 일을 추가해보세요!"
 *   action={{
 *     label: "첫 할 일 만들기",
 *     onClick: handleCreate,
 *     variant: "primary"
 *   }}
 * />
 * ```
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📄',
  title,
  description,
  action,
  withCard = true,
  className = '',
  iconSize = 'lg',
}) => {
  const getIconSizeClass = () => {
    switch (iconSize) {
      case 'sm': return 'h1';
      case 'md': return 'display-6';
      case 'lg': return 'display-1';
      case 'xl': return 'display-1 fw-bold';
      default: return 'display-1';
    }
  };

  const content = (
    <div className={`text-center py-5 ${className}`}>
      {icon && (
        <div className={`${getIconSizeClass()} mb-3`}>
          {typeof icon === 'string' ? icon : icon}
        </div>
      )}
      <h4 className="mb-3">{title}</h4>
      {description && (
        <p className="text-body-secondary mb-4">
          {description}
        </p>
      )}
      {action && (
        <Button 
          variant={action.variant || 'primary'}
          onClick={action.onClick}
          disabled={action.disabled}
        >
          {action.label}
        </Button>
      )}
    </div>
  );

  if (!withCard) {
    return content;
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        {content}
      </Card.Body>
    </Card>
  );
};

export default EmptyState;
