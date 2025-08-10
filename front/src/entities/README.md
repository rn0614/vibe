# Entities Layer - 도메인별 특화 Hooks 가이드

> 실제 DB 연결 후 여기에 도메인별 특화 hooks를 구현하세요

## 📁 구조

```
entities/
├── user/
│   ├── hooks/
│   │   └── useUsers.ts     # User 도메인 특화 hooks
│   ├── types/
│   │   └── index.ts        # User 관련 타입들
│   └── index.ts            # Public API
├── post/
│   ├── hooks/
│   │   └── usePosts.ts     # Post 도메인 특화 hooks
│   ├── types/
│   │   └── index.ts        # Post 관련 타입들
│   └── index.ts            # Public API
└── README.md               # 이 파일
```

## 🚀 도메인별 Hook 구현 예시

### 1. User 도메인 Hook

`entities/user/hooks/useUsers.ts`:

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/shared/api';
import { 
  QUERY_KEYS, 
  handleSupabaseError, 
  useInvalidateQueries 
} from '@/shared/hooks';
import type { Tables, TablesInsert, TablesUpdate } from '@/shared/types/database';

// 타입 정의
type User = Tables<'users'>;
type UserInsert = TablesInsert<'users'>;
type UserUpdate = TablesUpdate<'users'>;

export interface UserFilters {
  status?: 'active' | 'inactive';
  role?: 'admin' | 'user';
  search?: string;
}

// 복잡한 사용자 목록 조회
export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: QUERY_KEYS.users.list(filters || {}),
    queryFn: async (): Promise<User[]> => {
      try {
        let query = supabase
          .from('users')
          .select('id, name, email, avatar_url, status, role, created_at');

        // 동적 필터링
        if (filters?.status) {
          query = query.eq('status', filters.status);
        }
        
        if (filters?.search) {
          query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
        }

        const { data, error } = await query
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) handleSupabaseError(error);
        return data;
      } catch (error) {
        handleSupabaseError(error);
      }
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 사용자 생성
export const useCreateUser = () => {
  const { invalidateEntityLists } = useInvalidateQueries();

  return useMutation({
    mutationFn: async (userData: UserInsert): Promise<User> => {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert(userData)
          .select()
          .single();

        if (error) handleSupabaseError(error);
        return data;
      } catch (error) {
        handleSupabaseError(error);
      }
    },
    onSuccess: () => {
      invalidateEntityLists('users');
    },
  });
};
```

### 2. Post 도메인 Hook

`entities/post/hooks/usePosts.ts`:

```typescript
// 작성자 정보 포함 확장 타입
export interface PostWithAuthor extends Tables<'posts'> {
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

// 복잡한 JOIN 쿼리
export const usePostsWithAuthors = (filters?: PostFilters) => {
  return useQuery({
    queryKey: QUERY_KEYS.posts.list(filters || {}),
    queryFn: async (): Promise<PostWithAuthor[]> => {
      try {
        let query = supabase
          .from('posts')
          .select(`
            id, title, content, excerpt, status, published_at, created_at,
            users!posts_author_id_fkey (
              id, name, avatar_url
            )
          `);

        // 필터링 로직
        if (filters?.status) query = query.eq('status', filters.status);
        if (filters?.search) {
          query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
        }

        const { data, error } = await query
          .order('published_at', { ascending: false, nullsFirst: false })
          .limit(20);

        if (error) handleSupabaseError(error);

        // 데이터 변환
        return data.map(post => ({
          ...post,
          author: {
            id: post.users.id,
            name: post.users.name,
            avatar_url: post.users.avatar_url,
          }
        }));
      } catch (error) {
        handleSupabaseError(error);
      }
    }
  });
};
```

### 3. Public API 정의

`entities/user/index.ts`:

```typescript
// User entity public API
export * from './hooks/useUsers';
export type { UserFilters } from './hooks/useUsers';
```

### 4. 컴포넌트에서 사용

```typescript
// components/UsersList.tsx
import { useUsers, useCreateUser } from '@/entities/user';

const UsersList = () => {
  const { data: users, isLoading } = useUsers({ status: 'active' });
  const createUser = useCreateUser();

  return (
    <div>
      {users?.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
};
```

## 💡 구현 팁

### 1. **Query Key 표준화**
```typescript
// QUERY_KEYS 사용
QUERY_KEYS.users.list({ status: 'active' })     // ['users', 'list', { status: 'active' }]
QUERY_KEYS.users.detail('123')                  // ['users', 'detail', '123']
```

### 2. **에러 처리**
```typescript
// handleSupabaseError 사용
try {
  const { data, error } = await supabase.from('users').select('*');
  if (error) handleSupabaseError(error);
  return data;
} catch (error) {
  handleSupabaseError(error);
}
```

### 3. **쿼리 무효화**
```typescript
const { invalidateEntityLists, invalidateEntityDetail } = useInvalidateQueries();

// 목록 무효화
invalidateEntityLists('users');

// 특정 아이템 무효화
invalidateEntityDetail('users', userId);
```

### 4. **페이지네이션**
```typescript
import { createPaginationQuery, createPaginationResult } from '@/shared/hooks';

const { from, to } = createPaginationQuery({ page: 0, pageSize: 20 });
const result = createPaginationResult(data, count, { page: 0, pageSize: 20 });
```

## 🔄 개발 워크플로우

1. **DB 스키마 생성** → Supabase에서 테이블 생성
2. **타입 생성** → `npm run supabase:types` 실행
3. **도메인 폴더 생성** → `entities/[domain]/`
4. **Hook 구현** → 비즈니스 로직에 맞는 특화 hooks
5. **Public API 정의** → `index.ts`에서 export
6. **컴포넌트에서 사용** → import해서 사용

이 구조를 통해 복잡한 비즈니스 로직을 효과적으로 관리하고 타입 안전성을 확보할 수 있습니다.
