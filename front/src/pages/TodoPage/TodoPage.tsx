import React, { useState } from "react";
import {
  createSupabaseQuery,
  useSupabaseQueryBuilder,
  useSupabaseMutationBuilder,
} from "@/domains/supabaseCommon/hooks/useSupabaseQueryBuilderV2";
import { useAuth } from "@/domains/auth/hooks/useAuth";
import { ResponsiveTable, type TableColumn } from "@/components/molecules/ResponsiveTable";
import { TodoStats } from "@/components/molecules/TodoStats";
import { Pagination } from "@/components/molecules/Pagination";
import { EmptyState } from "@/components/molecules/EmptyState";
import { ErrorState } from "@/components/molecules/ErrorState";
import { SearchForm } from "@/components/molecules/SearchForm";
import { ButtonGroup } from "@/components/molecules/ButtonGroup";
import { RefreshButton } from "@/components/atoms/RefreshButton";
import { EditButton } from "@/components/atoms/EditButton";
import { DeleteButton } from "@/components/atoms/DeleteButton";
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge,
  Spinner
} from 'react-bootstrap';
import type { Tables } from "@/shared/types/database";
import { getRelativeTime } from "@/shared/util/time";
/**
 * 할 일 목록 페이지
 *
 * 새로운 타입 안전한 Query Builder를 사용하여:
 * - 할 일 목록 조회 (Soft Delete 적용: deleted_at이 null인 항목만)
 * - 페이지네이션
 * - 정렬 및 필터링
 * - 실시간 업데이트
 * - Soft Delete 삭제 (deleted_at에 현재 시간 설정)
 */

type TodoItem = Tables<"tb_todolist">;

export const TodoPage: React.FC = () => {
  // 인증 상태
  const { user } = useAuth();

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize] = useState<number>(5);

  // 정렬 상태
  const [sortColumn, setSortColumn] = useState<keyof TodoItem>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // 검색 상태
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");

  // ==========================================================================
  // 쿼리 빌더를 사용한 데이터 조회
  // ==========================================================================

  // 메인 할 일 목록 쿼리 (페이지네이션 + 검색 + 카운트 통합)
  // 정렬은 클라이언트 사이드에서 처리
  const todosQuery = React.useMemo(() => {
    let query = createSupabaseQuery("tb_todolist").select("*"); // 모든 컬럼 조회

    // 🗑️ Soft Delete: 삭제되지 않은 레코드만 조회 (필수!)
    query = query.where("deleted_at", "is", null);

    // 검색어가 있으면 title 필드에서 검색
    if (searchTerm.trim()) {
      query = query.searchInColumn("title", searchTerm.trim());
    }

    // 정렬은 클라이언트에서 처리하므로 서버 쿼리에서 제외
    // 기본 정렬을 created_at desc로 설정 (일관성을 위해)
    query = query.orderByDesc("created_at");

    // 페이지네이션 적용
    query = query.paginate({ page: currentPage, size: pageSize });

    // 카운트도 함께 조회 (핵심 개선!)
    query = query.withCount();

    return query;
  }, [currentPage, pageSize, searchTerm]); // sortColumn, sortDirection 제거

  // 통합 데이터 조회 (데이터 + 총 개수)
  const {
    data: result,
    isLoading,
    error,
    refetch,
  } = useSupabaseQueryBuilder(todosQuery);

  // ==========================================================================
  // 계산된 값들 (통합된 응답에서 추출)
  // ==========================================================================

  // 통합 응답에서 데이터와 카운트 분리
  const rawTodos =
    result && "data" in result
      ? result.data
      : Array.isArray(result)
      ? result
      : [];
  const totalCount = result && "totalCount" in result ? result.totalCount : 0;

  // 🎯 클라이언트 사이드 정렬 처리
  const todos = React.useMemo(() => {
    if (!rawTodos || !Array.isArray(rawTodos)) return [];

    return [...rawTodos].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      // null/undefined 값 처리
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
      if (bValue == null) return sortDirection === 'asc' ? 1 : -1;

      // 숫자 비교
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // 문자열 비교 (날짜 포함)
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rawTodos, sortColumn, sortDirection]);

  const totalPages = Math.ceil(totalCount / pageSize);

  // ==========================================================================
  // 뮤테이션 (추가/수정/Soft 삭제)
  // ==========================================================================

  const createTodo = useSupabaseMutationBuilder("tb_todolist", "insert", {
    onSuccess: () => {
      refetch(); // 목록 새로고침
    },
    onError: (error) => {
      alert(`할 일 생성 실패: ${error.message}`);
    },
  });

  const updateTodo = useSupabaseMutationBuilder("tb_todolist", "update", {
    onSuccess: () => {
      refetch(); // 목록 새로고침
    },
    onError: (error) => {
      alert(`할 일 수정 실패: ${error.message}`);
    },
  });

  // 🗑️ Soft Delete: delete 뮤테이션 사용하지 않음 (update 뮤테이션 사용)
  // const deleteTodo = useSupabaseMutationBuilder("tb_todolist", "delete", {
  //   onSuccess: () => {
  //     refetch(); // 목록 새로고침
  //   },
  //   onError: (error) => {
  //     alert(`할 일 삭제 실패: ${error.message}`);
  //   },
  // });

  // ==========================================================================
  // 이벤트 핸들러들
  // ==========================================================================

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };





  const handleRefresh = () => {
    refetch();
  };

  const handleEditTodo = (todo: TodoItem) => {
    // 🗑️ 이미 삭제된 항목인지 확인 (Soft Delete 정책)
    if (todo.deleted_at !== null) {
      alert('삭제된 할 일은 수정할 수 없습니다.');
      return;
    }

    // 제목 수정
    const newTitle = window.prompt(
      `할 일 제목을 수정하세요:`,
      todo.title || ''
    );
    
    if (newTitle !== null && newTitle.trim() !== todo.title) {
      // 설명도 함께 수정할지 물어보기
      const newDescription = window.prompt(
        `설명도 수정하시겠습니까? (취소하면 제목만 수정됩니다)`,
        todo.description || ''
      );
      
      updateTodo.mutate({
        id: todo.id.toString(),
        data: {
          title: newTitle.trim() || null,
          description: newDescription !== null ? (newDescription.trim() || null) : todo.description,
          updated_at: new Date().toISOString(),
        },
      });
    }
  };

  const handleDeleteTodo = (todo: TodoItem) => {
    // 🗑️ 이미 삭제된 항목인지 확인 (Soft Delete 정책)
    if (todo.deleted_at !== null) {
      alert('이미 삭제된 할 일입니다.');
      return;
    }

    const shouldDelete = window.confirm(
      `할 일 #${todo.id}을(를) 정말 삭제하시겠습니까?\n\n제목: ${todo.title || '(제목 없음)'}\n생성일: ${new Date(todo.created_at).toLocaleString("ko-KR")}\n\n※ 삭제된 할 일은 휴지통에서 복구할 수 있습니다.`
    );
    
    if (shouldDelete) {
      // 🗑️ Soft Delete: deleted_at에 현재 시간 설정
      updateTodo.mutate({
        id: todo.id.toString(),
        data: {
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    }
  };

  const handleCreateTodo = () => {
    const title = window.prompt("새 할 일의 제목을 입력하세요:");
    
    if (title !== null && title.trim()) {
      const description = window.prompt("설명을 입력하세요 (선택사항):");
      
      createTodo.mutate({
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          user_email: user?.email || null,
          created_at: new Date().toISOString(),
        },
      });
    }
  };

  // ==========================================================================
  // 테이블 컬럼 정의
  // ==========================================================================

  const tableColumns: TableColumn<TodoItem>[] = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: '80px',
      render: (value: number) => (
        <Badge bg="secondary" pill>#{value}</Badge>
      ),
    },
    {
      key: 'title',
      label: '제목',
      sortable: true,
      width: '200px',
      render: (value: string | null) => (
        <div className="fw-medium">
          {value || <span className="text-body-secondary">(제목 없음)</span>}
        </div>
      ),
    },
    {
      key: 'description',
      label: '설명',
      truncate: true,
      width: '200px',
      render: (value: string | null) => (
        <div>
          {value ? (
            <span className="text-body-secondary">
              {value.length > 50 
                ? `${value.substring(0, 50)}...`
                : value
              }
            </span>
          ) : (
            <span className="text-body-secondary fst-italic">(설명 없음)</span>
          )}
        </div>
      ),
    },
    {
      key: 'user_email',
      label: '작성자',
      truncate: 'sm',
      width: '150px',
      render: (value: string | null) => (
        <div>
          {value ? (
            <small className="text-body-secondary">{value}</small>
          ) : (
            <span className="text-body-secondary fst-italic">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      label: '생성일',
      sortable: true,
      width: '160px',
      render: (value: string) => (
        <div>
          <div className="fw-medium">
            {new Date(value).toLocaleString("ko-KR")}
          </div>
          <small className="text-body-secondary">
            {getRelativeTime(value)}
          </small>
        </div>
      ),
    },
    {
      key: 'updated_at',
      label: '수정일',
      sortable: true,
      width: '160px',
      render: (value: string | null) => (
        <div>
          {value ? (
            <>
              <div className="fw-medium">
                {new Date(value).toLocaleString("ko-KR")}
              </div>
              <small className="text-info">
                {getRelativeTime(value)}
              </small>
            </>
          ) : (
            <span className="text-body-secondary fst-italic">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: '작업',
      width: '140px',
      render: (_, todo: TodoItem) => (
        <ButtonGroup gap={1} size="sm">
          <EditButton
            onClick={() => handleEditTodo(todo)}
            processing={updateTodo.isPending}
          />
          <DeleteButton
            onClick={() => handleDeleteTodo(todo)}
            processing={updateTodo.isPending}
          />
        </ButtonGroup>
      ),
    },
  ];

  // ==========================================================================
  // 렌더링
  // ==========================================================================

  if (error) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <ErrorState
              title="🚨 오류가 발생했습니다"
              message="할 일 목록을 불러올 수 없습니다."
              error={error}
              onRetry={handleRefresh}
              retryLabel="다시 시도"
              showErrorDetails
            />
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* 헤더 영역 */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              {/* 제목과 통계 */}
              <Row className="align-items-center mb-3">
                <Col>
                  <h1 className="h3 fw-bold mb-1">📝 할 일 목록</h1>
                  <TodoStats
                    totalCount={totalCount}
                    isLoading={isLoading}
                    isUpdating={updateTodo.isPending}
                    isCreating={createTodo.isPending}
                  />
                </Col>
              </Row>

              {/* 검색 및 액션 버튼 */}
              <Row className="g-3">
                <Col md={6}>
                  <SearchForm
                    value={inputValue}
                    onChange={(value) => {
                      setInputValue(value);
                    }}
                    onSubmit={() => {
                      setSearchTerm(inputValue);
                      setCurrentPage(0);
                    }}
                    onClear={() => {
                      setInputValue("");
                      setSearchTerm("");
                      setCurrentPage(0);
                    }}
                    placeholder="제목으로 검색 (예: 할 일)"
                    disabled={isLoading || updateTodo.isPending || createTodo.isPending}
                  />
                </Col>
                <Col md={6}>
                  <ButtonGroup gap={2} justify="end" size="sm">
                    <RefreshButton
                      onClick={handleRefresh}
                      loading={isLoading}
                      disabled={updateTodo.isPending || createTodo.isPending}
                    />
                    <Button
                      variant="primary"
                      onClick={handleCreateTodo}
                      disabled={createTodo.isPending}
                    >
                      {createTodo.isPending ? "⏳" : "➕"} 만들기
                    </Button>
                  </ButtonGroup>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 할 일 목록 */}
      <Row>
        <Col>
          {isLoading && !result ? (
            // 첫 로딩이나 페이지 이동시 스피너 표시
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <Spinner className="mb-3" />
                <p className="text-body-secondary mb-0">할 일 목록을 불러오는 중...</p>
              </Card.Body>
            </Card>
          ) : todos && Array.isArray(todos) && todos.length > 0 ? (
            // 데이터가 있을 때 테이블 표시
            <ResponsiveTable
              columns={tableColumns}
              data={todos}
              onSort={(column, direction) => {
                setSortColumn(column as keyof TodoItem);
                setSortDirection(direction);
              }}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              loading={isLoading}
              keyExtractor={(todo) => todo.id}
              minWidth="900px"
              ariaLabel="할 일 목록 테이블"
              emptyMessage="데이터가 없습니다."
            />
          ) : (
            // 데이터가 없을 때만 EmptyState 표시
            <EmptyState
              icon="📝"
              title="할 일이 없습니다"
              description={
                searchTerm
                  ? `"${searchTerm}"에 대한 검색 결과가 없습니다.`
                  : inputValue
                  ? `"${inputValue}" 검색 중... 잠시 기다려주세요.`
                  : "첫 번째 할 일을 추가해보세요!"
              }
              action={
                !searchTerm && !inputValue
                  ? {
                      label: createTodo.isPending ? "⏳ 생성 중..." : "➕ 첫 할 일 만들기",
                      onClick: handleCreateTodo,
                      variant: "primary",
                      disabled: createTodo.isPending,
                    }
                  : undefined
              }
            />
          )}
        </Col>
      </Row>

      {/* 페이지네이션 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        itemUnit="개"
        variant="card"
      />
    </Container>
  );
};

// =============================================================================
// 유틸리티 함수들
// =============================================================================



export default TodoPage;
