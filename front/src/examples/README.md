# Query Builder 사용 예시

> HOC 기반 Supabase Query Builder의 실제 사용 예시들

## 🎯 핵심 기능 4가지 조합

사용자가 요청한 기본 조건들을 모두 조합하여 사용하는 예시입니다:

### 1. ✅ 정확한 값 일치 (eq)
```typescript
const query = createSupabaseQuery('users')
  .where('status', 'eq', 'active')
  .where('role', 'eq', 'admin');
```

### 2. 🔍 특정 단어 포함 (search)
```typescript
const query = createSupabaseQuery('users')
  .search(['name', 'email'], searchTerm); // 여러 컬럼에서 검색
```

### 3. 📄 페이지네이션 (pagination)
```typescript
const query = createSupabaseQuery('users')
  .paginate({ page: 0, size: 20 });
```

### 4. 🎯 단일 레코드 조회 (single)
```typescript
const query = createSupabaseQuery('users')
  .where('id', 'eq', userId)
  .single(); // 단일 레코드만 반환
```

## 🚀 실제 사용 패턴들

### 체이닝 방식 (HOC 패턴)
```typescript
// 복합 조건을 체이닝으로 연결
const usersQuery = createSupabaseQuery('users')
  .select('id, name, email, status, role')
  .where('status', 'eq', 'active')           // 조건 1: 정확한 값
  .where('role', 'in', ['admin', 'user'])    // 조건 2: 배열 매칭
  .search(['name', 'email'], searchTerm)     // 조건 3: 텍스트 검색
  .paginate({ page: 0, size: 20 })          // 조건 4: 페이지네이션
  .sort('created_at', 'desc');              // 정렬

const { data: users, isLoading } = useSupabaseQueryBuilder(usersQuery);
```

### 조건부 쿼리 생성
```typescript
// 복잡한 조건을 객체로 한 번에 정의
const complexQuery = createConditionalQuery('posts', {
  select: 'id, title, content, author_id, users!posts_author_id_fkey(name)',
  where: [
    { column: 'status', operator: 'eq', value: 'published' },
    { column: 'category', operator: 'in', value: ['tech', 'news'] }
  ],
  search: {
    columns: ['title', 'content'],
    term: searchTerm
  },
  sort: [
    { column: 'published_at', direction: 'desc' }
  ],
  pagination: { page: currentPage, size: 10 }
});

const { data: posts } = useSupabaseQueryBuilder(complexQuery);
```

### 뮤테이션 패턴
```typescript
// 생성, 수정, 삭제 뮤테이션
const createUser = useSupabaseMutationBuilder('users', 'insert', {
  invalidateQueries: ['users'],
  onSuccess: (newUser) => console.log('생성됨:', newUser)
});

const updateUser = useSupabaseMutationBuilder('users', 'update', {
  invalidateQueries: ['users']
});

const deleteUser = useSupabaseMutationBuilder('users', 'delete', {
  invalidateQueries: ['users']
});

// 사용법
createUser.mutate({ data: { name: 'John', email: 'john@example.com' } });
updateUser.mutate({ id: '123', data: { name: 'Jane' } });
deleteUser.mutate({ id: '123' });
```

## 📊 실제 컴포넌트 예시

`QueryBuilderExamples.tsx` 파일에서 다음 예시들을 확인할 수 있습니다:

### 1. **UserSearchExample**
- 4가지 기본 조건을 모두 조합한 사용자 검색
- 실시간 필터링 및 페이지네이션
- 상태별, 역할별 필터링

### 2. **SingleUserExample**
- 단일 사용자 상세 조회
- ID 기반 정확한 매칭

### 3. **ConditionalQueryExample**
- 조건부 쿼리 생성 헬퍼 사용
- 체크박스 기반 다중 선택 필터

### 4. **MutationExample**
- 생성, 수정, 삭제 뮤테이션
- 실시간 쿼리 무효화

### 5. **CountExample**
- 카운트 전용 쿼리
- 통계 데이터 조회

## 🔧 핵심 장점

### ✅ **조합 가능성**
- 여러 조건을 자유롭게 조합
- 체이닝으로 가독성 높은 코드
- 재사용 가능한 쿼리 빌더

### ✅ **타입 안전성**
- TypeScript 완전 지원
- 컴파일 타임 에러 체크
- IDE 자동완성

### ✅ **성능 최적화**
- React Query 기반 캐싱
- 조건별 쿼리 키 자동 생성
- 불필요한 요청 방지

### ✅ **개발 편의성**
- 직관적인 API
- 풍부한 사용 예시
- 에러 처리 자동화

## 🚀 실제 프로덕션 적용

```typescript
// 1. 기본 훅 정의 (entities/user/hooks/useUsers.ts)
export const useUsers = (filters: UserFilters) => {
  const query = createSupabaseQuery<User>('users')
    .select('id, name, email, status, role, created_at');

  if (filters.status !== 'all') {
    query = query.where('status', 'eq', filters.status);
  }

  if (filters.search) {
    query = query.search(['name', 'email'], filters.search);
  }

  return useSupabaseQueryBuilder(
    query.paginate(filters.pagination).sort('created_at', 'desc')
  );
};

// 2. 컴포넌트에서 사용
const UsersList = () => {
  const { data: users, isLoading } = useUsers({
    status: 'active',
    search: searchTerm,
    pagination: { page: 0, size: 20 }
  });

  return (
    <div>
      {users?.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
};
```

이 패턴을 통해 복잡한 비즈니스 로직을 간단하고 재사용 가능한 형태로 구현할 수 있습니다.
