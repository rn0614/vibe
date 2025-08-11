import { IconButton } from '@/components/atoms/IconButton';
import { useTheme } from '@/hooks/useTheme';

export interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, effectiveTheme, toggleTheme } = useTheme();

  const getThemeIcon = () => {
    return effectiveTheme === 'dark' ? '🌙' : '☀️';
  };

  const getThemeTitle = () => {
    return `현재 테마: ${theme === 'auto' ? `자동 (${effectiveTheme})` : effectiveTheme}`;
  };

  return (
    <IconButton
      icon={getThemeIcon()}
      onClick={toggleTheme}
      title={getThemeTitle()}
      className={className}
    />
  );
};

