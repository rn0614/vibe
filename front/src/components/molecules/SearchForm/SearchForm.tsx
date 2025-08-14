import React from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';

export interface SearchFormProps {
  /** 현재 검색어 */
  value: string;
  /** 검색어 변경 핸들러 */
  onChange: (value: string) => void;
  /** 검색 제출 핸들러 */
  onSubmit?: (value: string) => void;
  /** 검색어 초기화 핸들러 */
  onClear?: () => void;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 검색 버튼 표시 여부 */
  showSearchButton?: boolean;
  /** 초기화 버튼 표시 여부 */
  showClearButton?: boolean;
  /** 검색 버튼 아이콘/텍스트 */
  searchIcon?: React.ReactNode;
  /** 초기화 버튼 아이콘/텍스트 */
  clearIcon?: React.ReactNode;
  /** 검색 버튼 variant */
  searchButtonVariant?: string;
  /** 초기화 버튼 variant */
  clearButtonVariant?: string;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 추가 클래스명 */
  className?: string;
  /** 입력 필드 크기 */
  size?: 'sm' | 'lg';
}

/**
 * 검색 기능을 제공하는 공용 컴포넌트
 * 
 * @example
 * ```tsx
 * <SearchForm
 *   value={searchTerm}
 *   onChange={setSearchTerm}
 *   onSubmit={handleSearch}
 *   placeholder="제목으로 검색..."
 *   showClearButton
 * />
 * ```
 */
export const SearchForm: React.FC<SearchFormProps> = ({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = '검색어를 입력하세요',
  showSearchButton = true,
  showClearButton = true,
  searchIcon = '🔍',
  clearIcon = '✕',
  searchButtonVariant = 'outline-secondary',
  clearButtonVariant = 'outline-danger',
  disabled = false,
  className = '',
  size,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(value);
    }
  };

  const handleClear = () => {
    onChange('');
    if (onClear) {
      onClear();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <Form onSubmit={handleSubmit} className={className}>
      <InputGroup size={size}>
        <Form.Control
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
        />
        
        {showSearchButton && (
          <Button 
            variant={searchButtonVariant} 
            type="submit"
            disabled={disabled}
            title="검색"
          >
            {searchIcon}
          </Button>
        )}
        
        {showClearButton && value && (
          <Button
            variant={clearButtonVariant}
            onClick={handleClear}
            disabled={disabled}
            title="검색어 초기화"
          >
            {clearIcon}
          </Button>
        )}
      </InputGroup>
    </Form>
  );
};

export default SearchForm;
