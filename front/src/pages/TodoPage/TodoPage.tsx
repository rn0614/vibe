import React, { useState } from "react";
import {
  createSupabaseQuery,
  useSupabaseQueryBuilder,
  useSupabaseMutationBuilder,
} from "@/shared/hooks";
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Table, 
  Badge, 
  Pagination,
  Accordion,
  InputGroup,
  Spinner,
  Alert
} from 'react-bootstrap';
import type { Tables } from "@/shared/types/database";
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
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Alert variant="danger" className="text-center">
              <Alert.Heading>🚨 오류가 발생했습니다</Alert.Heading>
              <p>할 일 목록을 불러올 수 없습니다.</p>
              <hr />
              <div className="d-flex justify-content-center">
                <Button variant="outline-danger" onClick={handleRefresh}>
                  다시 시도
                </Button>
              </div>
              <Accordion className="mt-3">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>오류 세부사항</Accordion.Header>
                  <Accordion.Body>
                    <pre className="text-body-secondary small">
                      {error instanceof Error ? error.message : "알 수 없는 오류"}
                    </pre>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Alert>
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
                  <div className="d-flex align-items-center gap-3">
                    <Badge bg="primary" pill>총 {totalCount}개</Badge>
                    {isLoading && (
                      <div className="d-flex align-items-center text-body-secondary">
                        <Spinner size="sm" className="me-2" />
                        로딩 중...
                      </div>
                    )}
                  </div>
                </Col>
              </Row>

              {/* 검색 및 액션 버튼 */}
              <Row className="g-3">
                <Col md={6}>
                  <Form onSubmit={handleSearchSubmit}>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="날짜로 검색 (예: 2024)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Button variant="outline-secondary" type="submit">
                        🔍
                      </Button>
                      {searchTerm && (
                        <Button
                          variant="outline-danger"
                          onClick={() => {
                            setSearchTerm("");
                            setCurrentPage(0);
                          }}
                        >
                          ✕
                        </Button>
                      )}
                    </InputGroup>
                  </Form>
                </Col>
                <Col md={6}>
                  <div className="d-flex gap-2 justify-content-md-end">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      ⚙️ 필터
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={isLoading}
                    >
                      🔄 새로고침
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => createTodo.mutate({})}
                    >
                      ➕ 만들기
                    </Button>
                  </div>
                </Col>
              </Row>

              {/* 필터 패널 */}
              {showFilters && (
                <Row className="mt-3">
                  <Col>
                    <Card className="bg-body-secondary border-0">
                      <Card.Body className="py-3">
                        <Row className="g-3 align-items-center">
                          <Col auto>
                            <Form.Label className="mb-0 fw-semibold">정렬 기준:</Form.Label>
                          </Col>
                          <Col auto>
                            <Form.Select
                              size="sm"
                              value={sortColumn}
                              onChange={(e) =>
                                setSortColumn(e.target.value as keyof TodoItem)
                              }
                            >
                              <option value="id">ID</option>
                              <option value="created_at">생성일</option>
                            </Form.Select>
                          </Col>
                          <Col auto>
                            <Form.Select
                              size="sm"
                              value={sortDirection}
                              onChange={(e) =>
                                setSortDirection(e.target.value as "asc" | "desc")
                              }
                            >
                              <option value="asc">오름차순</option>
                              <option value="desc">내림차순</option>
                            </Form.Select>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 할 일 목록 */}
      <Row>
        <Col>
          {isLoading && todos === undefined ? (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <Spinner className="mb-3" />
                <p className="text-body-secondary mb-0">할 일 목록을 불러오는 중...</p>
              </Card.Body>
            </Card>
          ) : todos && Array.isArray(todos) && todos.length > 0 ? (
            <Card className="border-0 shadow-sm">
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSortChange("id")}
                    >
                      ID{" "}
                      {sortColumn === "id" && (
                        <span className="text-primary">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </th>
                    <th 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSortChange("created_at")}
                    >
                      생성일{" "}
                      {sortColumn === "created_at" && (
                        <span className="text-primary">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {todos.map((todo) => (
                    <tr key={todo.id}>
                      <td>
                        <Badge bg="secondary" pill>#{todo.id}</Badge>
                      </td>
                      <td>
                        <div>
                          <div className="fw-medium">
                            {new Date(todo.created_at).toLocaleString("ko-KR")}
                          </div>
                          <small className="text-body-secondary">
                            {getRelativeTime(todo.created_at)}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button variant="outline-primary" size="sm">
                            ✏️ 수정
                          </Button>
                          <Button variant="outline-danger" size="sm">
                            🗑️ 삭제
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <div className="display-1 mb-3">📝</div>
                <h4 className="mb-3">할 일이 없습니다</h4>
                <p className="text-body-secondary mb-4">
                  {searchTerm
                    ? `"${searchTerm}"에 대한 검색 결과가 없습니다.`
                    : "첫 번째 할 일을 추가해보세요!"}
                </p>
                {!searchTerm && (
                  <Button 
                    variant="primary" 
                    onClick={() => createTodo.mutate({})}
                  >
                    ➕ 첫 할 일 만들기
                  </Button>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Row className="mt-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Row className="align-items-center">
                  <Col>
                    <small className="text-body-secondary">
                      {currentPage * pageSize + 1}-
                      {Math.min((currentPage + 1) * pageSize, totalCount)} / {totalCount}개 표시
                    </small>
                  </Col>
                  <Col xs="auto">
                    <Pagination className="mb-0" size="sm">
                      <Pagination.First 
                        onClick={() => handlePageChange(0)}
                        disabled={!hasPrevPage}
                      />
                      <Pagination.Prev 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!hasPrevPage}
                      />
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                        return (
                          <Pagination.Item
                            key={pageNum}
                            active={pageNum === currentPage}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum + 1}
                          </Pagination.Item>
                        );
                      })}
                      
                      <Pagination.Next 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!hasNextPage}
                      />
                      <Pagination.Last 
                        onClick={() => handlePageChange(totalPages - 1)}
                        disabled={!hasNextPage}
                      />
                    </Pagination>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
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
