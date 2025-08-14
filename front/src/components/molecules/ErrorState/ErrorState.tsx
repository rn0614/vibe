import React from 'react';
import { Alert, Button, Accordion } from 'react-bootstrap';

export interface ErrorStateProps {
  /** 에러 제목 */
  title?: string;
  /** 에러 메시지 */
  message: string;
  /** 에러 객체 (세부사항 표시용) */
  error?: Error | unknown;
  /** 재시도 액션 */
  onRetry?: () => void;
  /** 재시도 버튼 텍스트 */
  retryLabel?: string;
  /** Alert variant */
  variant?: 'danger' | 'warning' | 'info';
  /** 추가 액션 버튼들 */
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: string;
    disabled?: boolean;
  }>;
  /** 에러 세부사항 표시 여부 */
  showErrorDetails?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 에러 상태를 표시하는 공용 컴포넌트
 * 
 * @example
 * ```tsx
 * <ErrorState
 *   title="데이터 로딩 실패"
 *   message="할 일 목록을 불러올 수 없습니다."
 *   error={error}
 *   onRetry={handleRetry}
 *   showErrorDetails
 * />
 * ```
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = '오류가 발생했습니다',
  message,
  error,
  onRetry,
  retryLabel = '다시 시도',
  variant = 'danger',
  actions = [],
  showErrorDetails = true,
  className = '',
}) => {

  const getErrorMessage = () => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error) {
      return JSON.stringify(error, null, 2);
    }
    return '알 수 없는 오류';
  };

  const getIcon = () => {
    switch (variant) {
      case 'danger': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '🚨';
    }
  };

  return (
    <Alert variant={variant} className={`text-center ${className}`}>
      <Alert.Heading>{getIcon()} {title}</Alert.Heading>
      <p>{message}</p>
      
      {(onRetry || actions.length > 0) && (
        <>
          <hr />
          <div className="d-flex justify-content-center gap-2 flex-wrap">
            {onRetry && (
              <Button variant={`outline-${variant}`} onClick={onRetry}>
                {retryLabel}
              </Button>
            )}
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || `outline-${variant}`}
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </>
      )}

      {showErrorDetails && error ? (
        <Accordion className="mt-3">
          <Accordion.Item eventKey="0">
            <Accordion.Header>오류 세부사항</Accordion.Header>
            <Accordion.Body>
              <pre className="text-body-secondary small text-start">
                {getErrorMessage()}
              </pre>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      ) : null}
    </Alert>
  );
};

export default ErrorState;
