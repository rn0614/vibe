import React from "react";
import { Button, type ButtonProps } from "react-bootstrap";
import { useActionDebounce } from "@/shared/util/debounce";

export interface EditButtonProps extends Omit<ButtonProps, "onClick"> {
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
}

/**
 * 수정 기능을 제공하는 Atom 버튼 컴포넌트
 *
 * @example
 * ```tsx
 * <EditButton
 *   onClick={() => handleEdit(item)}
 *   processing={isUpdating}
 *   variant="outline-primary"
 *   size="sm"
 * >
 *   수정
 * </EditButton>
 * ```
 */
export const EditButton: React.FC<EditButtonProps> = ({
  onClick,
  processing = false,
  children = "수정",
  processingContent = "⏳",
  icon = "✏️",
  disabled,
  variant = "outline-primary",
  size = "sm",
  title,
  ...props
}) => {
  // 중복 클릭 방지를 위한 debounce 적용 (300ms)
  const [debouncedClick, isDebouncing] = useActionDebounce(onClick, 300);

  const buttonContent = processing ? (
    <>
      {processingContent}{" "}
      {typeof children === "string" ? "처리 중..." : children}
    </>
  ) : (
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
      title={title || (processing || isDebouncing ? "처리 중..." : "수정")}
    >
      {buttonContent}
    </Button>
  );
};

export default EditButton;
