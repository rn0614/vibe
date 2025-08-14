import React from 'react';
import { Badge, Spinner } from 'react-bootstrap';

export interface TodoStatsProps {
  /** 총 아이템 개수 */
  totalCount: number;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 업데이트 진행 중 */
  isUpdating?: boolean;
  /** 생성 진행 중 */
  isCreating?: boolean;
  /** 기타 진행 중 작업 (커스텀 메시지) */
  customPendingMessage?: string;
  /** 클래스명 추가 */
  className?: string;
}

/**
 * 할 일 목록 통계 정보를 표시하는 Molecule 컴포넌트
 * 
 * @example
 * ```tsx
 * <TodoStats 
 *   totalCount={25}
 *   isLoading={false}
 *   isUpdating={true}
 * />
 * ```
 */
export const TodoStats: React.FC<TodoStatsProps> = ({
  totalCount,
  isLoading = false,
  isUpdating = false,
  isCreating = false,
  customPendingMessage,
  className = '',
}) => {
  const showSpinner = isLoading || isUpdating || isCreating || !!customPendingMessage;
  
  const getLoadingMessage = () => {
    if (customPendingMessage) return customPendingMessage;
    if (isLoading) return "로딩 중...";
    if (isUpdating) return "처리 중...";
    if (isCreating) return "생성 중...";
    return "";
  };

  return (
    <div className={`d-flex align-items-center gap-3 ${className}`}>
      <Badge bg="primary" pill>
        총 {totalCount.toLocaleString()}개
      </Badge>
      
      {showSpinner && (
        <div className="d-flex align-items-center text-body-secondary">
          <Spinner size="sm" className="me-2" />
          <span>{getLoadingMessage()}</span>
        </div>
      )}
    </div>
  );
};

export default TodoStats;
