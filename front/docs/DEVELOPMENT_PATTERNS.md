# 🎯 개발 패턴 가이드

> 실제 개발에서 검증된 패턴들과 주의사항

## 🏗️ **아키텍처 패턴**

### 1. **State Management 분리 원칙**

#### ✅ **올바른 분리**
```typescript
// TanStack Query: 서버 상태
const { user, posts, isLoading } = useQuery(['posts'], fetchPosts);

// Zustand: 클라이언트 상태  
const { theme, sidebarOpen, notifications } = useAppStore();

// React State: 컴포넌트 로컬 상태
const [email, setEmail] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);
```

#### ❌ **피해야 할 안티패턴**
```typescript
// ❌ 서버 상태를 Zustand에 저장
const userStore = create((set) => ({
  user: null, // 서버에서 오는 데이터를 클라이언트 스토어에 저장
}));

// ❌ 클라이언트 상태를 TanStack Query에 저장  
const { data: theme } = useQuery(['theme'], () => localStorage.getItem('theme'));
```

### 2. **Hook 분리 패턴**

#### **Core Hook + Action Hook 패턴**
```typescript
// Core Hook (비즈니스 로직, Router 독립)
export const useAuth = () => {
  const userQuery = useQuery(['auth', 'user'], fetchUser);
  const signOutMutation = useMutation(signOutApi);
  
  return {
    user: userQuery.data,
    signOut: signOutMutation.mutate,
    signOutAsync: signOutMutation.mutateAsync, // await 가능
  };
};

// Action Hook (UI 로직, Router 의존)
export const useAuthActions = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  
  const signOutWithRedirect = async (redirectTo = '/') => {
    await auth.signOutAsync();
    navigate(redirectTo, { replace: true });
  };
  
  return { ...auth, signOutWithRedirect };
};
```

### 3. **Component Layer별 Hook 사용**

```typescript
// AuthInitializer (Router 밖) - Core Hook만
const AuthInitializer = () => {
  useAuth(); // ✅ Router 독립적
  return <>{children}</>;
};

// Header (Router 안) - Action Hook 
const Header = () => {
  const { user, signOutWithRedirect } = useAuthActions(); // ✅ Navigation 포함
};

// UserCard (어디서나) - Core Hook
const UserCard = ({ userId }) => {
  const { user } = useAuth(); // ✅ 순수한 상태만 필요
};
```

## 🔄 **API 패턴**

### 1. **TanStack Query Mutation 패턴**

#### **Basic Mutation**
```typescript
const createPostMutation = useMutation({
  mutationFn: (data: CreatePostData) => postsApi.create(data),
  onSuccess: (data) => {
    // 관련 쿼리 무효화
    queryClient.invalidateQueries(['posts']);
    queryClient.invalidateQueries(['posts', data.categoryId]);
  },
  onError: (error) => {
    // 에러 처리
    console.error('포스트 생성 실패:', error);
  },
});
```

#### **Optimistic Update**
```typescript
const updatePostMutation = useMutation({
  mutationFn: updatePost,
  onMutate: async (variables) => {
    // 기존 쿼리 취소
    await queryClient.cancelQueries(['posts', variables.id]);
    
    // 이전 데이터 스냅샷
    const previousPost = queryClient.getQueryData(['posts', variables.id]);
    
    // Optimistic update
    queryClient.setQueryData(['posts', variables.id], (old) => ({
      ...old,
      ...variables,
    }));
    
    return { previousPost };
  },
  onError: (err, variables, context) => {
    // 롤백
    if (context?.previousPost) {
      queryClient.setQueryData(['posts', variables.id], context.previousPost);
    }
  },
  onSettled: (data, error, variables) => {
    // 최종 동기화
    queryClient.invalidateQueries(['posts', variables.id]);
  },
});
```

### 2. **API Response 일관성**

#### **apiWrapper 패턴**
```typescript
// shared/api/client.ts
export const apiWrapper = async <T>(promise: Promise<T>) => {
  try {
    const result = await promise;
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// 사용
const response = await apiWrapper(supabase.auth.signIn({ email, password }));
if (response.error) {
  // 에러 처리
} else {
  // 성공 처리
  const user = response.data.user;
}
```

## 🎨 **Component 패턴**

### 1. **FSD Layer별 Component 패턴**

#### **shared/ui - 재사용 컴포넌트**
```typescript
// 범용적, props로 모든 것 제어
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
  onClick?: () => void;
}

export const Button: FC<ButtonProps> = ({ variant = 'primary', ...props }) => {
  // 순수한 UI 로직만
};
```

#### **entities - 비즈니스 엔티티**
```typescript
// 특정 도메인 데이터 표시
interface UserCardProps {
  user: User;
  showActions?: boolean;
}

export const UserCard: FC<UserCardProps> = ({ user, showActions }) => {
  // user 엔티티에 특화된 로직
  const { user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === user.id;
  
  return (
    <div>
      <Avatar src={user.avatar} />
      <h3>{user.name}</h3>
      {showActions && isOwnProfile && <EditButton />}
    </div>
  );
};
```

#### **features - 사용자 상호작용**
```typescript
// 특정 기능에 특화
export const PostCreateForm: FC = () => {
  const { createPostWithRedirect } = usePostActions();
  const [formData, setFormData] = useState<CreatePostData>({});
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await createPostWithRedirect(formData, '/posts');
  };
  
  return <form onSubmit={handleSubmit}>{/* 폼 내용 */}</form>;
};
```

### 2. **Props 패턴**

#### **Discriminated Union Props**
```typescript
interface ButtonBaseProps {
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

type ButtonProps = ButtonBaseProps & (
  | { variant: 'link'; href: string; onClick?: never }
  | { variant?: 'primary' | 'secondary'; href?: never; onClick: () => void }
);

// 사용 시 타입 안전성 보장
<Button variant="link" href="/about" />     // ✅ onClick 불필요
<Button variant="primary" onClick={action} /> // ✅ href 불필요
```

#### **Render Props / Children as Function**
```typescript
interface DataLoaderProps<T> {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
  children: (data: T, isLoading: boolean, error: Error | null) => ReactNode;
}

const DataLoader = <T,>({ queryKey, queryFn, children }: DataLoaderProps<T>) => {
  const { data, isLoading, error } = useQuery(queryKey, queryFn);
  return children(data, isLoading, error);
};

// 사용
<DataLoader queryKey={['posts']} queryFn={fetchPosts}>
  {(posts, isLoading, error) => (
    isLoading ? <Spinner /> : <PostList posts={posts} />
  )}
</DataLoader>
```

## 🛡️ **Error Handling 패턴**

### 1. **ErrorBoundary + React Query**

```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅
    console.error('Error caught by boundary:', error);
    
    // 에러 리포팅 (선택적)
    if (typeof window !== 'undefined') {
      // analytics.track('error', { error: error.message });
    }
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}

// App.tsx에서 적용
<ErrorBoundary>
  <QueryProvider>
    <App />
  </QueryProvider>
</ErrorBoundary>
```

### 2. **Query Error 처리**

```typescript
// 글로벌 에러 처리
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // 인증 에러는 재시도 안 함
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 2;
      },
      onError: (error: any) => {
        // 글로벌 에러 처리
        if (error?.status === 401) {
          // 로그아웃 처리
          window.location.href = '/login';
        }
      },
    },
    mutations: {
      onError: (error: any) => {
        // 사용자에게 에러 알림
        toast.error(error.message || '오류가 발생했습니다.');
      },
    },
  },
});
```

## 🎯 **Performance 패턴**

### 1. **React.memo + useCallback**

```typescript
// 최적화된 컴포넌트
const PostItem = memo<PostItemProps>(({ post, onEdit, onDelete }) => {
  return (
    <div>
      <h3>{post.title}</h3>
      <button onClick={() => onEdit(post.id)}>편집</button>
      <button onClick={() => onDelete(post.id)}>삭제</button>
    </div>
  );
});

// 부모 컴포넌트에서 useCallback 사용
const PostList = () => {
  const handleEdit = useCallback((id: string) => {
    navigate(`/posts/${id}/edit`);
  }, [navigate]);
  
  const handleDelete = useCallback((id: string) => {
    deletePostMutation.mutate(id);
  }, [deletePostMutation]);
  
  return (
    <div>
      {posts.map(post => (
        <PostItem 
          key={post.id}
          post={post}
          onEdit={handleEdit}   // 레퍼런스 안정성 보장
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};
```

### 2. **Virtual List (대용량 데이터)**

```typescript
import { FixedSizeList as List } from 'react-window';

const VirtualPostList = ({ posts }: { posts: Post[] }) => {
  const Row = ({ index, style }: { index: number; style: CSSProperties }) => (
    <div style={style}>
      <PostItem post={posts[index]} />
    </div>
  );
  
  return (
    <List
      height={600}
      itemCount={posts.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

## 📋 **Code Review 체크리스트**

### ✅ **아키텍처**
- [ ] FSD 레이어가 올바른가?
- [ ] 상태 관리 도구 선택이 적절한가? (TanStack Query vs Zustand vs React State)
- [ ] Hook 분리가 올바른가? (Core vs Action)
- [ ] Router 컨텍스트 의존성이 명확한가?

### ✅ **Performance**
- [ ] 불필요한 리렌더링이 없는가?
- [ ] useCallback/useMemo가 적절히 사용되었는가?
- [ ] 큰 리스트에 가상화가 적용되었는가?

### ✅ **Error Handling**
- [ ] ErrorBoundary가 적절히 배치되었는가?
- [ ] API 에러 처리가 일관적인가?
- [ ] 사용자 친화적인 에러 메시지인가?

### ✅ **Type Safety**
- [ ] any 타입 사용을 최소화했는가?
- [ ] Props interface가 명확한가?
- [ ] Discriminated Union이 적절히 사용되었는가?

## 🔗 **관련 문서**

- [HOOKS_ARCHITECTURE_GUIDE.md](./HOOKS_ARCHITECTURE_GUIDE.md) - Hook 분리 패턴
- [AUTH_UNIFIED_ARCHITECTURE.md](./AUTH_UNIFIED_ARCHITECTURE.md) - 인증 시스템
- [FSD 가이드](.cursor/rules/main.mdc) - Feature-Sliced Design 원칙

