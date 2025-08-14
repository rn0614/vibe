import React from 'react';

export interface ButtonGroupProps {
  /** 버튼들 */
  children: React.ReactNode;
  /** 정렬 방향 */
  direction?: 'horizontal' | 'vertical';
  /** 간격 크기 */
  gap?: 1 | 2 | 3 | 4 | 5;
  /** 정렬 위치 */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** 랩핑 여부 */
  wrap?: boolean;
  /** 추가 클래스명 */
  className?: string;
  /** 버튼 크기 (자식에게 적용) */
  size?: 'sm' | 'lg';
  /** 전체 비활성화 */
  disabled?: boolean;
}

/**
 * 여러 버튼을 그룹으로 관리하는 컴포넌트
 * 
 * @example
 * ```tsx
 * <ButtonGroup gap={2} justify="end">
 *   <RefreshButton onClick={handleRefresh} loading={isLoading} />
 *   <Button variant="primary" onClick={handleCreate}>
 *     만들기
 *   </Button>
 * </ButtonGroup>
 * ```
 */
export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  direction = 'horizontal',
  gap = 2,
  justify = 'start',
  wrap = false,
  className = '',
  size,
  disabled = false,
}) => {
  const getFlexDirection = () => {
    return direction === 'vertical' ? 'flex-column' : '';
  };

  const getJustifyClass = () => {
    switch (justify) {
      case 'center': return 'justify-content-center';
      case 'end': return 'justify-content-end';
      case 'between': return 'justify-content-between';
      case 'around': return 'justify-content-around';
      case 'evenly': return 'justify-content-evenly';
      default: return 'justify-content-start';
    }
  };

  const getAlignClass = () => {
    return direction === 'vertical' ? 'align-items-stretch' : 'align-items-center';
  };

  const classes = [
    'd-flex',
    getFlexDirection(),
    getJustifyClass(),
    getAlignClass(),
    `gap-${gap}`,
    wrap ? 'flex-wrap' : '',
    className
  ].filter(Boolean).join(' ');

  // 자식 컴포넌트에 size와 disabled 전달
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const props: any = {};
      const childProps = child.props as any;
      
      if (size && !childProps.size) {
        props.size = size;
      }
      
      if (disabled && childProps.disabled === undefined) {
        props.disabled = disabled;
      }
      
      if (Object.keys(props).length > 0) {
        return React.cloneElement(child, props);
      }
    }
    return child;
  });

  return (
    <div className={classes}>
      {enhancedChildren}
    </div>
  );
};

export default ButtonGroup;
