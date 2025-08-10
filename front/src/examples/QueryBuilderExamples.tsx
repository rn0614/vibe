import React, { useState } from 'react';
import { 
  createSupabaseQuery, 
  createConditionalQuery,
  useSupabaseQueryBuilder,
  useSupabaseMutationBuilder
} from '@/shared/hooks';
import type { Tables } from '@/shared/types/database';

/**
 * Query Builder 사용 예시 컴포넌트
 * 
 * 사용자가 요청한 4가지 기본 조건들을 모두 조합하여 사용하는 예시:
 * 1. 특정 단어를 포함한 경우 (search)
 * 2. pagination 
 * 3. 하나만 조회하는 경우 (single)
 * 4. 정확히 컬럼값이 요청값과 일치하는 경우 (where eq)
 */

// 타입 정의 (실제 DB 연결 시 Tables<'users'> 사용)
type User = Tables<'users'> | {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  role: 'admin' | 'user';
  avatar_url?: string;
  created_at: string;
};

// =============================================================================
// 예시 1: 복합 조건 사용자 검색 (모든 조건 조합)
// =============================================================================

export const UserSearchExample: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<'admin' | 'user' | 'all'>('all');

  // 🚀 HOC 체이닝 방식으로 복합 조건 구성
  const usersQuery = React.useMemo(() => {
    let query = createSupabaseQuery<User>('users')
      .select('id, name, email, status, role, avatar_url, created_at');

    // 조건 1: 정확한 값 일치 (eq)
    if (statusFilter !== 'all') {
      query = query.where('status', 'eq', statusFilter);
    }
    
    if (roleFilter !== 'all') {
      query = query.where('role', 'eq', roleFilter);
    }

    // 조건 2: 특정 단어 포함 (search)
    if (searchTerm.trim()) {
      query = query.search(['name', 'email'], searchTerm);
    }

    // 조건 3: pagination
    query = query
      .paginate({ page: currentPage, size: 10 })
      .sort('created_at', 'desc');

    return query;
  }, [searchTerm, currentPage, statusFilter, roleFilter]);

  const { data: users, isLoading, error } = useSupabaseQueryBuilder(usersQuery);

  return (
    <div className="user-search-example">
      <h2>🔍 복합 조건 사용자 검색</h2>
      
      {/* 검색 필터 UI */}
      <div className="filters">
        <input
          type="text"
          placeholder="이름 또는 이메일 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
          <option value="all">모든 상태</option>
          <option value="active">활성</option>
          <option value="inactive">비활성</option>
        </select>
        
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)}>
          <option value="all">모든 역할</option>
          <option value="admin">관리자</option>
          <option value="user">사용자</option>
        </select>
      </div>

      {/* 결과 표시 */}
      {isLoading && <div>🔄 로딩 중...</div>}
      {error && <div>❌ 에러: {error.message}</div>}
      
      {users && (
        <div>
          <h3>검색 결과 ({Array.isArray(users) ? users.length : 0}명)</h3>
          {Array.isArray(users) && users.map((user) => (
            <div key={user.id} className="user-card">
              <h4>{user.name}</h4>
              <p>{user.email}</p>
              <span className={`status ${user.status}`}>{user.status}</span>
              <span className={`role ${user.role}`}>{user.role}</span>
            </div>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      <div className="pagination">
        <button 
          onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
          disabled={currentPage === 0}
        >
          이전
        </button>
        <span>페이지 {currentPage + 1}</span>
        <button onClick={() => setCurrentPage(p => p + 1)}>
          다음
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// 예시 2: 단일 사용자 조회 (single 조건 사용)
// =============================================================================

export const SingleUserExample: React.FC<{ userId?: string }> = ({ userId }) => {
  // 조건 4: 단일 레코드 조회 (single)
  const userQuery = React.useMemo(() => {
    if (!userId) return null;
    
    return createSupabaseQuery<User>('users')
      .select('*')
      .where('id', 'eq', userId)
      .single(); // 단일 레코드만 조회
  }, [userId]);

  const { data: user, isLoading } = useSupabaseQueryBuilder(userQuery!, {
    enabled: !!userQuery
  });

  if (!userId) return <div>사용자 ID를 입력하세요</div>;

  return (
    <div className="single-user-example">
      <h2>👤 단일 사용자 조회</h2>
      
      {isLoading && <div>🔄 로딩 중...</div>}
      
      {user && !Array.isArray(user) && (
        <div className="user-detail">
          <h3>{user.name}</h3>
          <p>이메일: {user.email}</p>
          <p>상태: {user.status}</p>
          <p>역할: {user.role}</p>
          <p>가입일: {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// 예시 3: 조건부 쿼리 생성 헬퍼 사용
// =============================================================================

export const ConditionalQueryExample: React.FC = () => {
  const [filters, setFilters] = useState({
    search: '',
    status: 'active' as 'active' | 'inactive',
    roles: [] as ('admin' | 'user')[],
    page: 0
  });

  // 🔧 createConditionalQuery를 사용한 조건부 쿼리 생성
  const complexQuery = React.useMemo(() => {
    return createConditionalQuery<User>('users', {
      select: 'id, name, email, status, role, created_at',
      where: [
        { column: 'status', operator: 'eq', value: filters.status },
        ...(filters.roles.length > 0 ? [{
          column: 'role',
          operator: 'in' as const,
          value: filters.roles
        }] : [])
      ],
      search: filters.search ? {
        columns: ['name', 'email'],
        term: filters.search
      } : undefined,
      sort: [
        { column: 'created_at', direction: 'desc' as const }
      ],
      pagination: { page: filters.page, size: 15 }
    });
  }, [filters]);

  const { data: users, isLoading } = useSupabaseQueryBuilder(complexQuery);

  return (
    <div className="conditional-query-example">
      <h2>⚙️ 조건부 쿼리 생성 예시</h2>
      
      <div className="filters">
        <input
          type="text"
          placeholder="검색어 입력..."
          value={filters.search}
          onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
        />
        
        <div>
          <label>
            <input
              type="checkbox"
              checked={filters.roles.includes('admin')}
              onChange={(e) => {
                setFilters(f => ({
                  ...f,
                  roles: e.target.checked 
                    ? [...f.roles, 'admin']
                    : f.roles.filter(r => r !== 'admin')
                }));
              }}
            />
            관리자 포함
          </label>
          
          <label>
            <input
              type="checkbox"
              checked={filters.roles.includes('user')}
              onChange={(e) => {
                setFilters(f => ({
                  ...f,
                  roles: e.target.checked 
                    ? [...f.roles, 'user']
                    : f.roles.filter(r => r !== 'user')
                }));
              }}
            />
            일반 사용자 포함
          </label>
        </div>
      </div>

      {isLoading && <div>🔄 로딩 중...</div>}
      
      {users && Array.isArray(users) && (
        <div>
          <h3>결과: {users.length}명</h3>
          {users.map((user) => (
            <div key={user.id} className="user-item">
              {user.name} ({user.email}) - {user.role}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// 예시 4: 뮤테이션 사용 (생성, 수정, 삭제)
// =============================================================================

export const MutationExample: React.FC = () => {
  const [newUser, setNewUser] = useState({ name: '', email: '' });

  // 뮤테이션 hooks
  const createUser = useSupabaseMutationBuilder<User>('users', 'insert', {
    invalidateQueries: ['users'],
    onSuccess: (user) => {
      alert(`사용자 생성됨: ${user.name}`);
      setNewUser({ name: '', email: '' });
    }
  });

  const updateUser = useSupabaseMutationBuilder<User>('users', 'update', {
    invalidateQueries: ['users'],
    onSuccess: () => alert('사용자 업데이트됨')
  });

  const deleteUser = useSupabaseMutationBuilder('users', 'delete', {
    invalidateQueries: ['users'],
    onSuccess: () => alert('사용자 삭제됨')
  });

  return (
    <div className="mutation-example">
      <h2>🔄 뮤테이션 예시</h2>
      
      {/* 사용자 생성 */}
      <div className="create-user">
        <h3>새 사용자 생성</h3>
        <input
          type="text"
          placeholder="이름"
          value={newUser.name}
          onChange={(e) => setNewUser(u => ({ ...u, name: e.target.value }))}
        />
        <input
          type="email"
          placeholder="이메일"
          value={newUser.email}
          onChange={(e) => setNewUser(u => ({ ...u, email: e.target.value }))}
        />
        <button
          onClick={() => createUser.mutate({ 
            data: { 
              ...newUser, 
              status: 'active',
              role: 'user'
            } 
          })}
          disabled={createUser.isPending}
        >
          {createUser.isPending ? '생성 중...' : '사용자 생성'}
        </button>
      </div>

      {/* 사용자 업데이트 예시 */}
      <div className="update-user">
        <h3>사용자 업데이트</h3>
        <button
          onClick={() => updateUser.mutate({
            id: 'user-id-123',
            data: { name: '업데이트된 이름' }
          })}
          disabled={updateUser.isPending}
        >
          {updateUser.isPending ? '업데이트 중...' : '이름 업데이트'}
        </button>
      </div>

      {/* 사용자 삭제 예시 */}
      <div className="delete-user">
        <h3>사용자 삭제</h3>
        <button
          onClick={() => {
            if (confirm('정말 삭제하시겠습니까?')) {
              deleteUser.mutate({ id: 'user-id-123' });
            }
          }}
          disabled={deleteUser.isPending}
        >
          {deleteUser.isPending ? '삭제 중...' : '사용자 삭제'}
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// 예시 5: 카운트 쿼리
// =============================================================================

export const CountExample: React.FC = () => {
  // 활성 사용자 수 조회
  const activeUsersCountQuery = createSupabaseQuery('users')
    .where('status', 'eq', 'active')
    .count();

  const { data: activeCount } = useSupabaseQueryBuilder(activeUsersCountQuery);

  // 관리자 수 조회
  const adminCountQuery = createSupabaseQuery('users')
    .where('role', 'eq', 'admin')
    .count();

  const { data: adminCount } = useSupabaseQueryBuilder(adminCountQuery);

  return (
    <div className="count-example">
      <h2>📊 카운트 쿼리 예시</h2>
      
      <div className="stats">
        <div className="stat-item">
          <h3>활성 사용자</h3>
          <p>{activeCount && !Array.isArray(activeCount) ? activeCount.count : 0}명</p>
        </div>
        
        <div className="stat-item">
          <h3>관리자</h3>
          <p>{adminCount && !Array.isArray(adminCount) ? adminCount.count : 0}명</p>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// 통합 예시 컴포넌트
// =============================================================================

export const QueryBuilderExamples: React.FC = () => {
  const [selectedExample, setSelectedExample] = useState<string>('search');

  return (
    <div className="query-builder-examples">
      <h1>🚀 Supabase Query Builder 사용 예시</h1>
      
      <nav className="example-nav">
        <button 
          onClick={() => setSelectedExample('search')}
          className={selectedExample === 'search' ? 'active' : ''}
        >
          복합 조건 검색
        </button>
        <button 
          onClick={() => setSelectedExample('single')}
          className={selectedExample === 'single' ? 'active' : ''}
        >
          단일 레코드 조회
        </button>
        <button 
          onClick={() => setSelectedExample('conditional')}
          className={selectedExample === 'conditional' ? 'active' : ''}
        >
          조건부 쿼리
        </button>
        <button 
          onClick={() => setSelectedExample('mutation')}
          className={selectedExample === 'mutation' ? 'active' : ''}
        >
          뮤테이션
        </button>
        <button 
          onClick={() => setSelectedExample('count')}
          className={selectedExample === 'count' ? 'active' : ''}
        >
          카운트 쿼리
        </button>
      </nav>

      <div className="example-content">
        {selectedExample === 'search' && <UserSearchExample />}
        {selectedExample === 'single' && <SingleUserExample userId="user-123" />}
        {selectedExample === 'conditional' && <ConditionalQueryExample />}
        {selectedExample === 'mutation' && <MutationExample />}
        {selectedExample === 'count' && <CountExample />}
      </div>
    </div>
  );
};

export default QueryBuilderExamples;
