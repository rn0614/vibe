import React from 'react';
import { Row, Col, Card, Pagination as BSPagination } from 'react-bootstrap';

export interface PaginationProps {
  /** 현재 페이지 (0부터 시작) */
  currentPage: number;
  /** 총 페이지 수 */
  totalPages: number;
  /** 총 아이템 수 */
  totalCount: number;
  /** 페이지당 아이템 수 */
  pageSize: number;
  /** 페이지 변경 핸들러 */
  onPageChange: (page: number) => void;
  /** 페이지네이션 크기 */
  size?: 'sm' | 'lg';
  /** 추가 클래스명 */
  className?: string;
  /** 최대 표시할 페이지 번호 개수 */
  maxPageNumbers?: number;
  /** 페이지네이션 스타일 */
  variant?: 'card' | 'simple';
  /** 아이템 단위명 (예: "개", "명", "건") */
  itemUnit?: string;
  /** 정보 표시 텍스트 커스텀 */
  infoText?: (start: number, end: number, total: number) => string;
}

/**
 * 범용 페이지네이션 컴포넌트
 * 
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={2}
 *   totalPages={10}
 *   totalCount={48}
 *   pageSize={5}
 *   onPageChange={(page) => setCurrentPage(page)}
 *   itemUnit="개"
 *   variant="card"
 * />
 * ```
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  size = 'sm',
  className = '',
  maxPageNumbers = 5,
  variant = 'card',
  itemUnit = '개',
  infoText,
}) => {
  const hasPrevPage = currentPage > 0;
  const hasNextPage = currentPage < totalPages - 1;
  
  // 현재 표시되는 아이템 범위 계산
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalCount);

  // 정보 텍스트 생성
  const getInfoText = () => {
    if (infoText) {
      return infoText(startItem, endItem, totalCount);
    }
    return `${startItem.toLocaleString()}-${endItem.toLocaleString()} / ${totalCount.toLocaleString()}${itemUnit} 표시`;
  };

  // 표시할 페이지 번호들 계산
  const getPageNumbers = () => {
    const maxPages = Math.min(maxPageNumbers, totalPages);
    const halfMax = Math.floor(maxPages / 2);
    
    let startPage = Math.max(0, currentPage - halfMax);
    let endPage = Math.min(totalPages - 1, startPage + maxPages - 1);
    
    // 끝 페이지 기준으로 시작 페이지 재조정
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(0, endPage - maxPages + 1);
    }
    
    return Array.from(
      { length: endPage - startPage + 1 }, 
      (_, i) => startPage + i
    );
  };

  const pageNumbers = getPageNumbers();

  // 페이지가 1개 이하면 페이지네이션 숨김
  if (totalPages <= 1) {
    return null;
  }

  const paginationElement = (
    <BSPagination className="mb-0" size={size}>
      {/* 첫 페이지 */}
      <BSPagination.First 
        onClick={() => onPageChange(0)}
        disabled={!hasPrevPage}
        title="첫 페이지"
      />
      
      {/* 이전 페이지 */}
      <BSPagination.Prev 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}
        title="이전 페이지"
      />
      
      {/* 페이지 번호들 */}
      {pageNumbers.map((pageNum) => (
        <BSPagination.Item
          key={pageNum}
          active={pageNum === currentPage}
          onClick={() => onPageChange(pageNum)}
          title={`${pageNum + 1}페이지로 이동`}
        >
          {pageNum + 1}
        </BSPagination.Item>
      ))}
      
      {/* 다음 페이지 */}
      <BSPagination.Next 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        title="다음 페이지"
      />
      
      {/* 마지막 페이지 */}
      <BSPagination.Last 
        onClick={() => onPageChange(totalPages - 1)}
        disabled={!hasNextPage}
        title="마지막 페이지"
      />
    </BSPagination>
  );

  if (variant === 'simple') {
    return (
      <div className={`d-flex justify-content-between align-items-center ${className}`}>
        <small className="text-body-secondary">
          {getInfoText()}
        </small>
        {paginationElement}
      </div>
    );
  }

  return (
    <Row className={`mt-4 ${className}`}>
      <Col>
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <Row className="align-items-center">
              <Col>
                <small className="text-body-secondary">
                  {getInfoText()}
                </small>
              </Col>
              <Col xs="auto">
                {paginationElement}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Pagination;
