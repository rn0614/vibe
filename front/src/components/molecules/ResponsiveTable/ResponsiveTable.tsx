import React, { useState, useEffect, useRef } from 'react';
import { Table, Spinner } from 'react-bootstrap';
import styles from './ResponsiveTable.module.scss';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  truncate?: 'sm' | 'md' | 'lg' | boolean;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  width?: string | number;
}

export interface ResponsiveTableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  loading?: boolean;
  className?: string;
  minWidth?: string | number;
  hover?: boolean;
  striped?: boolean;
  bordered?: boolean;
  keyExtractor?: (item: T, index: number) => string | number;
  emptyMessage?: React.ReactNode;
  ariaLabel?: string;
}

export const ResponsiveTable = <T extends Record<string, any>>({
  columns,
  data,
  onSort,
  sortColumn,
  sortDirection = 'asc',
  loading = false,
  className = '',
  minWidth = '800px',
  hover = true,
  striped = false,
  bordered = false,
  keyExtractor = (item, index) => item.id || index,
  emptyMessage = '데이터가 없습니다.',
  ariaLabel = '데이터 테이블',
}: ResponsiveTableProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  // 스크롤 힌트 표시 여부 확인
  useEffect(() => {
    const checkScrollHint = () => {
      if (containerRef.current) {
        const { scrollWidth, clientWidth } = containerRef.current;
        setShowScrollHint(scrollWidth > clientWidth);
      }
    };

    checkScrollHint();
    window.addEventListener('resize', checkScrollHint);
    
    return () => window.removeEventListener('resize', checkScrollHint);
  }, [data]);

  // 정렬 핸들러
  const handleSort = (columnKey: string) => {
    if (!onSort) return;
    
    const newDirection = 
      sortColumn === columnKey && sortDirection === 'asc' 
        ? 'desc' 
        : 'asc';
    
    onSort(columnKey, newDirection);
  };

  // 키보드 접근성
  const handleKeyDown = (event: React.KeyboardEvent, columnKey: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSort(columnKey);
    }
  };

  // 트렁케이트 클래스 생성
  const getTruncateClass = (truncate?: 'sm' | 'md' | 'lg' | boolean) => {
    if (!truncate) return '';
    if (truncate === true || truncate === 'md') return styles.truncate;
    if (truncate === 'sm') return styles.truncateSm;
    if (truncate === 'lg') return styles.truncateLg;
    return '';
  };

  // 값 추출 헬퍼
  const getValue = (item: T, key: string) => {
    return key.split('.').reduce((obj, path) => obj?.[path], item);
  };

  return (
    <div className={`${styles.responsiveTableContainer} ${className}`}>
      <div 
        ref={containerRef}
        className={loading ? styles.loadingOverlay : ''}
      >
        <Table
          hover={hover}
          striped={striped}
          bordered={bordered}
          className={styles.table}
          style={{ minWidth }}
          aria-label={ariaLabel}
        >
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    ${column.sortable ? styles.sortable : ''} 
                    ${column.className || ''}
                    ${getTruncateClass(column.truncate)}
                  `.trim()}
                  style={{ width: column.width }}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                  onKeyDown={column.sortable ? (e) => handleKeyDown(e, column.key) : undefined}
                  tabIndex={column.sortable ? 0 : -1}
                  role={column.sortable ? 'button' : undefined}
                  aria-sort={
                    column.sortable && sortColumn === column.key
                      ? sortDirection === 'asc' ? 'ascending' : 'descending'
                      : column.sortable ? 'none' : undefined
                  }
                >
                  {column.label}
                  {column.sortable && sortColumn === column.key && (
                    <span className={styles.sortIcon} aria-hidden="true">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                  {column.sortable && (
                    <span className={styles.srOnly}>
                      {sortColumn === column.key 
                        ? `현재 ${sortDirection === 'asc' ? '오름차순' : '내림차순'} 정렬됨`
                        : '정렬 가능한 컬럼'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="text-center py-5 text-body-secondary"
                >
                  {loading ? (
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <Spinner size="sm" />
                      로딩 중...
                    </div>
                  ) : (
                    emptyMessage
                  )}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={keyExtractor(item, index)}>
                  {columns.map((column) => {
                    const value = getValue(item, column.key);
                    return (
                      <td
                        key={column.key}
                        className={`
                          ${column.className || ''}
                          ${getTruncateClass(column.truncate)}
                        `.trim()}
                        style={{ width: column.width }}
                        title={
                          column.truncate && typeof value === 'string' 
                            ? value 
                            : undefined
                        }
                      >
                        {column.render 
                          ? column.render(value, item, index)
                          : (value == null ? '' : String(value))
                        }
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </Table>
        
        {/* 스크롤 힌트 */}
        <div className={`${styles.scrollHint} ${!showScrollHint ? styles.hidden : ''}`} />
        
        {/* 로딩 스피너 오버레이 */}
        {loading && (
          <div className="position-absolute top-50 start-50 translate-middle">
            <div className="d-flex align-items-center gap-2 bg-white p-3 rounded shadow">
              <Spinner size="sm" />
              <span>로딩 중...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsiveTable;
