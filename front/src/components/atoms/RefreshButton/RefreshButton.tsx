import { useActionDebounce } from '@/shared/util/debounce';
import React from 'react';
import { Button, type ButtonProps } from 'react-bootstrap';

export interface RefreshButtonProps extends Omit<ButtonProps, 'onClick'> {
  /** 클릭 핸들러 */
  onClick: () => void;
  /** 로딩 상태 */
  loading?: boolean;
  /** 버튼 텍스트 */
  children?: React.ReactNode;
  /** 로딩 중 표시할 아이콘/텍스트 */
  loadingContent?: React.ReactNode;
  /** 기본 아이콘 */
  icon?: React.ReactNode;
}

/**
 * 새로고침/조회 기능을 제공하는 Atom 버튼 컴포넌트
 * 
 * @example
 * ```tsx
 * <RefreshButton
 *   onClick={handleRefresh}
 *   loading={isLoading}
 *   variant="outline-primary"
 *   size="sm"
 * >
 *   새로고침
 * </RefreshButton>
 * ```
 */
export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onClick,
  loading = false,
  children = '새로고침',
  loadingContent = '⏳',
  icon = '🔄',
  disabled,
  variant = 'outline-primary',
  size = 'sm',
  title,
  ...props
}) => {
  // 중복 클릭 방지를 위한 debounce 적용 (300ms)
  const [debouncedClick, isDebouncing] = useActionDebounce(onClick, 300);

  const buttonContent = loading 
    ? (
        <>
          {loadingContent} {typeof children === 'string' ? '로딩 중...' : children}
        </>
      )
    : (
        <>
          {icon} {children}
        </>
      );

  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      onClick={debouncedClick}
      disabled={disabled || loading || isDebouncing}
      title={title || (loading||isDebouncing ? '로딩 중...' : '새로고침')}
    >
      {buttonContent}
    </Button>
  );
};

export default RefreshButton;
