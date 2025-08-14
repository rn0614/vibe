import React from 'react';
import { Button, type ButtonProps } from 'react-bootstrap';
import { useActionDebounce } from '@/shared/util/debounce';

export interface DeleteButtonProps extends Omit<ButtonProps, 'onClick'> {
  /** 클릭 핸들러 */
  onClick: () => void;
  /** 처리 중 상태 */
  processing?: boolean;
  /** 버튼 텍스트 */
  children?: React.ReactNode;
  /** 처리 중 표시할 아이콘/텍스트 */
  processingContent?: React.ReactNode;
  /** 기본 아이콘 */
  icon?: React.ReactNode;
  /** 확인 모달 표시 여부 */
  confirmAction?: boolean;
  /** 확인 메시지 */
  confirmMessage?: string;
}

/**
 * 삭제 기능을 제공하는 Atom 버튼 컴포넌트
 * 
 * @example
 * ```tsx
 * <DeleteButton
 *   onClick={() => handleDelete(item)}
 *   processing={isDeleting}
 *   variant="outline-danger"
 *   size="sm"
 *   confirmAction
 *   confirmMessage="정말 삭제하시겠습니까?"
 * >
 *   삭제
 * </DeleteButton>
 * ```
 */
export const DeleteButton: React.FC<DeleteButtonProps> = ({
  onClick,
  processing = false,
  children = '삭제',
  processingContent = '⏳',
  icon = '🗑️',
  disabled,
  variant = 'outline-danger',
  size = 'sm',
  title,
  confirmAction = false,
  confirmMessage = '정말 삭제하시겠습니까?',
  ...props
}) => {
  const handleClick = () => {
    if (confirmAction) {
      if (window.confirm(confirmMessage)) {
        onClick();
      }
    } else {
      onClick();
    }
  };

  // 중복 클릭 방지를 위한 debounce 적용 (500ms - 삭제는 좀 더 신중하게)
  const [debouncedClick, isDebouncing] = useActionDebounce(handleClick, 500);

  const buttonContent = processing 
    ? (
        <>
          {processingContent} {typeof children === 'string' ? '삭제 중...' : children}
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
      disabled={disabled || processing || isDebouncing}
      title={title || (processing ? '삭제 중...' : isDebouncing ? '잠시 기다려주세요...' : '삭제')}
    >
      {buttonContent}
    </Button>
  );
};

export default DeleteButton;
