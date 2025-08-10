import React, { useState } from "react";
import {
  createSupabaseQuery,
  useSupabaseQueryBuilder,
  useSupabaseMutationBuilder,
} from "@/shared/hooks";
import { Layout } from "@/shared/ui";
import type { Tables } from "@/shared/types/database";
import styles from "./TodoPage.module.scss";
/**
 * 할 일 목록 페이지
 *
 * 새로운 타입 안전한 Query Builder를 사용하여:
 * - 할 일 목록 조회
 * - 페이지네이션
 * - 정렬 및 필터링
 * - 실시간 업데이트
 */

type TodoItem = Tables<"tb_todolist">;

export const TodoPage: React.FC = () => {
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize] = useState<number>(10);

  // 정렬 상태
  const [sortColumn, setSortColumn] = useState<keyof TodoItem>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // 검색/필터 상태
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // ==========================================================================
  // 쿼리 빌더를 사용한 데이터 조회
  // ==========================================================================

  // 메인 할 일 목록 쿼리 (페이지네이션 + 정렬 + 검색 + 카운트 통합)
  const todosQuery = React.useMemo(() => {
    let query = createSupabaseQuery("tb_todolist").select("*"); // 모든 컬럼 조회

    // 검색어가 있으면 created_at 필드에서 검색
    if (searchTerm.trim()) {
      query = query.searchInColumn("created_at", searchTerm.trim());
    }

    // 정렬 적용
    if (sortDirection === "asc") {
      query = query.orderBy(sortColumn);
    } else {
      query = query.orderByDesc(sortColumn);
    }

    // 페이지네이션 적용
    query = query.paginate({ page: currentPage, size: pageSize });

    // 카운트도 함께 조회 (핵심 개선!)
    query = query.withCount();

    return query;
  }, [currentPage, pageSize, sortColumn, sortDirection, searchTerm]);

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
  const todos =
    result && "data" in result
      ? result.data
      : Array.isArray(result)
      ? result
      : [];
  const totalCount = result && "totalCount" in result ? result.totalCount : 0;

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = currentPage < totalPages - 1;
  const hasPrevPage = currentPage > 0;

  // ==========================================================================
  // 뮤테이션 (나중에 추가/수정/삭제용)
  // ==========================================================================

  const createTodo = useSupabaseMutationBuilder("tb_todolist", "insert", {
    onSuccess: () => {
      refetch(); // 목록 새로고침
    },
  });

  // ==========================================================================
  // 이벤트 핸들러들
  // ==========================================================================

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSortChange = (column: keyof TodoItem) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0); // 검색 시 첫 페이지로 이동
  };

  const handleRefresh = () => {
    refetch();
  };

  // ==========================================================================
  // 렌더링
  // ==========================================================================

  if (error) {
    return (
      <Layout>
        <div className={styles.errorContainer}>
          <h1>🚨 오류가 발생했습니다</h1>
          <p>할 일 목록을 불러올 수 없습니다.</p>
          <button onClick={handleRefresh} className={styles.retryButton}>
            다시 시도
          </button>
          <details className={styles.errorDetails}>
            <summary>오류 세부사항</summary>
            <pre>
              {error instanceof Error ? error.message : "알 수 없는 오류"}
            </pre>
          </details>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.todoPage}>
        {/* 헤더 영역 */}
        <header className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>📝 할 일 목록</h1>
            <div className={styles.stats}>
              <span className={styles.totalCount}>총 {totalCount}개</span>
              {isLoading && (
                <span className={styles.loadingIndicator}>🔄 로딩 중...</span>
              )}
            </div>
          </div>

          {/* 검색 및 필터 */}
          <div className={styles.controls}>
            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <input
                type="text"
                placeholder="날짜로 검색 (예: 2024)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchButton}>
                🔍 검색
              </button>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(0);
                  }}
                  className={styles.clearButton}
                >
                  ✕ 초기화
                </button>
              )}
            </form>

            <div className={styles.actionButtons}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={styles.filterToggle}
              >
                ⚙️ 필터 {showFilters ? "숨기기" : "보기"}
              </button>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className={styles.refreshButton}
              >
                🔄 새로고침
              </button>
              <button
                onClick={() => createTodo.mutate({})}
                className={styles.createFirstButton}
              >
                ➕ 할 일 만들기
              </button>
            </div>
          </div>

          {/* 확장 필터 패널 */}
          {showFilters && (
            <div className={styles.filtersPanel}>
              <div className={styles.sortControls}>
                <label className={styles.sortLabel}>정렬 기준:</label>
                <select
                  value={sortColumn}
                  onChange={(e) =>
                    setSortColumn(e.target.value as keyof TodoItem)
                  }
                  className={styles.sortSelect}
                >
                  <option value="id">ID</option>
                  <option value="created_at">생성일</option>
                </select>
                <select
                  value={sortDirection}
                  onChange={(e) =>
                    setSortDirection(e.target.value as "asc" | "desc")
                  }
                  className={styles.sortSelect}
                >
                  <option value="asc">오름차순</option>
                  <option value="desc">내림차순</option>
                </select>
              </div>
            </div>
          )}
        </header>

        {/* 할 일 목록 */}
        <main className={styles.content}>
          {isLoading && todos === undefined ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}>🔄</div>
              <p>할 일 목록을 불러오는 중...</p>
            </div>
          ) : todos && Array.isArray(todos) && todos.length > 0 ? (
            <>
              {/* 테이블 헤더 */}
              <div className={styles.tableContainer}>
                <table className={styles.todoTable}>
                  <thead>
                    <tr>
                      <th
                        className={styles.sortableHeader}
                        onClick={() => handleSortChange("id")}
                      >
                        ID{" "}
                        {sortColumn === "id" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        className={styles.sortableHeader}
                        onClick={() => handleSortChange("created_at")}
                      >
                        생성일{" "}
                        {sortColumn === "created_at" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                      </th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todos.map((todo) => (
                      <tr key={todo.id} className={styles.todoRow}>
                        <td className={styles.idCell}>
                          <span className={styles.idBadge}>#{todo.id}</span>
                        </td>
                        <td className={styles.dateCell}>
                          <div className={styles.dateInfo}>
                            <span className={styles.fullDate}>
                              {new Date(todo.created_at).toLocaleString(
                                "ko-KR"
                              )}
                            </span>
                            <span className={styles.relativeDate}>
                              {getRelativeTime(todo.created_at)}
                            </span>
                          </div>
                        </td>
                        <td className={styles.actionsCell}>
                          <button className={styles.actionButton}>
                            ✏️ 수정
                          </button>
                          <button className={styles.actionButton}>
                            🗑️ 삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📝</div>
              <h2>할 일이 없습니다</h2>
              <p>
                {searchTerm
                  ? `"${searchTerm}"에 대한 검색 결과가 없습니다.`
                  : "첫 번째 할 일을 추가해보세요!"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => createTodo.mutate({})}
                  className={styles.createFirstButton}
                >
                  ➕ 첫 할 일 만들기
                </button>
              )}
            </div>
          )}
        </main>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <footer className={styles.pagination}>
            <div className={styles.paginationInfo}>
              <span>
                {currentPage * pageSize + 1}-
                {Math.min((currentPage + 1) * pageSize, totalCount)}/{" "}
                {totalCount}개 표시
              </span>
            </div>

            <div className={styles.paginationControls}>
              <button
                onClick={() => handlePageChange(0)}
                disabled={!hasPrevPage}
                className={styles.paginationButton}
              >
                ⏮️ 처음
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPrevPage}
                className={styles.paginationButton}
              >
                ◀️ 이전
              </button>

              <div className={styles.pageNumbers}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum =
                    Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`${styles.pageButton} ${
                        pageNum === currentPage ? styles.currentPage : ""
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage}
                className={styles.paginationButton}
              >
                ▶️ 다음
              </button>
              <button
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={!hasNextPage}
                className={styles.paginationButton}
              >
                ⏭️ 마지막
              </button>
            </div>
          </footer>
        )}
      </div>
    </Layout>
  );
};

// =============================================================================
// 유틸리티 함수들
// =============================================================================

/**
 * 상대적 시간 표시 (예: "3분 전", "1시간 전")
 */
function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}일 전`;
  } else if (diffHours > 0) {
    return `${diffHours}시간 전`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}분 전`;
  } else {
    return "방금 전";
  }
}

export default TodoPage;
