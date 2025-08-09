import type { ReactNode } from 'react';
import styles from './Layout.module.scss';

export interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  const layoutClass = [styles.layout, className].filter(Boolean).join(' ');

  return (
    <div className={layoutClass}>
      {children}
    </div>
  );
};

export interface ContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({ 
  children, 
  size = 'xl',
  className = '' 
}) => {
  const containerClass = [
    styles.container,
    styles[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass}>
      {children}
    </div>
  );
};

export interface GridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Grid: React.FC<GridProps> = ({ 
  children, 
  cols = 1,
  gap = 'md',
  className = '' 
}) => {
  const gridClass = [
    styles.grid,
    styles[`cols${cols}`],
    styles[`gap${gap.charAt(0).toUpperCase() + gap.slice(1)}`],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={gridClass}>
      {children}
    </div>
  );
};

export interface FlexProps {
  children: ReactNode;
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Flex: React.FC<FlexProps> = ({
  children,
  direction = 'row',
  align = 'start',
  justify = 'start',
  wrap = false,
  gap = 'md',
  className = ''
}) => {
  const flexClass = [
    styles.flex,
    styles[direction],
    styles[`align${align.charAt(0).toUpperCase() + align.slice(1)}`],
    styles[`justify${justify.charAt(0).toUpperCase() + justify.slice(1)}`],
    wrap && styles.wrap,
    styles[`gap${gap.charAt(0).toUpperCase() + gap.slice(1)}`],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={flexClass}>
      {children}
    </div>
  );
};
