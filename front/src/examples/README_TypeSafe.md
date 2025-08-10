# 타입 안전한 Supabase Query Builder 가이드

> `tb_todolist` 테이블부터 시작하여 확장 가능한 타입 안전 아키텍처

## 🎯 **현재 상황**

### ✅ **해결된 문제: `any` 타입 제거**

**이전 문제:**
```typescript
// ❌ 이전: database.ts에 실제 테이블이 없어서 any 사용
Tables: {
  [_ in never]: never  // 빈 상태
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let query = supabase.from(this.table as any);
```

**현재 해결:**
```typescript
// ✅ 현재: 실제 테이블 타입 정의됨
Tables: {
  tb_todolist: {
    Row: { id: number; created_at: string; }
    Insert: { id?: number; created_at?: string; }
    Update: { id?: number; created_at?: string; }
    Relationships: []
  }
}

// ✅ 타입 안전한 쿼리 생성
const query = createSupabaseQuery('tb_todolist')  // 타입 체크됨!
  .select('id, created_at')                       // 컬럼명 체크됨!
  .where('id', 'eq', 123)                        // 타입 체크됨!
```

### 🔑 **핵심 타입 안전성**

```typescript
// 1. 테이블명 타입 안전성
type TableName = keyof Database['public']['Tables'];  // 'tb_todolist'

// 2. 컬럼명 타입 안전성  
type TodoColumns = keyof Tables<'tb_todolist'>;      // 'id' | 'created_at'

// 3. 값 타입 안전성
type IdType = Tables<'tb_todolist'>['id'];           // number
type CreatedAtType = Tables<'tb_todolist'>['created_at']; // string
```

## 🚀 **실제 사용 예시**

### 1. **기본 조회 (타입 안전)**

```typescript
import { createSupabaseQuery, useSupabaseQueryBuilder } from '@/shared/hooks';
import type { Tables } from '@/shared/types/database';

const TodoList = () => {
  // ✅ 'tb_todolist'만 허용됨 (다른 테이블명은 컴파일 에러)
  const todosQuery = createSupabaseQuery('tb_todolist')
    .select('id, created_at')  // ✅ 존재하는 컬럼만 허용
    .sort('created_at', 'desc'); // ✅ 컬럼명 타입 체크

  const { data: todos, isLoading } = useSupabaseQueryBuilder(todosQuery);

  return (
    <div>
      {todos?.map((todo: Tables<'tb_todolist'>) => (
        <div key={todo.id}>
          ID: {todo.id} {/* ✅ number 타입 */}
          생성일: {todo.created_at} {/* ✅ string 타입 */}
        </div>
      ))}
    </div>
  );
};
```

### 2. **WHERE 조건 (타입 안전)**

```typescript
const SpecificTodo = ({ todoId }: { todoId: number }) => {
  const todoQuery = createSupabaseQuery('tb_todolist')
    .select('*')
    .where('id', 'eq', todoId)  // ✅ id는 number 타입으로 체크됨
    .single();

  // 에러 예시들:
  // .where('wrong_column', 'eq', 1)     // ❌ 존재하지 않는 컬럼
  // .where('id', 'eq', 'wrong_type')    // ❌ string을 number 필드에 사용
  // .where('created_at', 'eq', 123)     // ❌ number를 string 필드에 사용

  const { data: todo } = useSupabaseQueryBuilder(todoQuery);
  
  return todo ? <div>할 일: {todo.id}</div> : null;
};
```

### 3. **뮤테이션 (타입 안전)**

```typescript
import { useSupabaseMutationBuilder } from '@/shared/hooks';
import type { TablesInsert, TablesUpdate } from '@/shared/types/database';

const TodoManager = () => {
  // ✅ INSERT 뮤테이션
  const createTodo = useSupabaseMutationBuilder('tb_todolist', 'insert', {
    onSuccess: (newTodo) => {
      console.log('생성된 할 일:', newTodo.id); // ✅ newTodo는 Tables<'tb_todolist'> 타입
    }
  });

  // ✅ UPDATE 뮤테이션  
  const updateTodo = useSupabaseMutationBuilder('tb_todolist', 'update');

  // ✅ DELETE 뮤테이션
  const deleteTodo = useSupabaseMutationBuilder('tb_todolist', 'delete');

  const handleCreate = () => {
    // ✅ TablesInsert<'tb_todolist'> 타입으로 체크
    const newData: TablesInsert<'tb_todolist'> = {
      // id는 선택적 (auto-increment)
      // created_at도 선택적 (기본값 사용)
    };

    createTodo.mutate({ data: newData });

    // 에러 예시:
    // createTodo.mutate({ data: { wrong_field: 'test' } }); // ❌ 존재하지 않는 필드
  };

  const handleUpdate = () => {
    // ✅ TablesUpdate<'tb_todolist'> 타입으로 체크
    const updateData: TablesUpdate<'tb_todolist'> = {
      created_at: new Date().toISOString()
    };

    updateTodo.mutate({ id: 1, data: updateData });
  };

  const handleDelete = () => {
    deleteTodo.mutate({ id: 1 });
  };

  return (
    <div>
      <button onClick={handleCreate}>할 일 생성</button>
      <button onClick={handleUpdate}>할 일 업데이트</button>
      <button onClick={handleDelete}>할 일 삭제</button>
    </div>
  );
};
```

## 📈 **미래 확장 계획**

### 🔄 **새 테이블 추가 시 자동 타입 안전성**

```typescript
// 1. Supabase에서 새 테이블 생성 (예: users)
// 2. npm run supabase:types 실행 → database.ts 자동 업데이트

// database.ts (자동 생성됨)
export type Database = {
  public: {
    Tables: {
      tb_todolist: { /* 기존 */ },
      users: {  // ← 새로 추가됨
        Row: {
          id: number;
          name: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          email: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          email?: string;
          updated_at?: string;
        };
      }
    }
  }
}

// 3. 즉시 타입 안전한 쿼리 사용 가능!
const usersQuery = createSupabaseQuery('users')  // ✅ 자동으로 허용됨
  .select('id, name, email')                     // ✅ 컬럼명 자동 체크
  .where('email', 'like', '%gmail.com')         // ✅ 타입 체크
  .sort('created_at', 'desc');                  // ✅ 정렬 안전

const { data: users } = useSupabaseQueryBuilder(usersQuery);
```

### 🏗️ **확장 예시: 복합 테이블 구조**

```typescript
// 미래의 복잡한 쿼리 예시
const postsWithAuthors = createSupabaseQuery('posts')
  .select(`
    id, title, content, published_at,
    users!posts_author_id_fkey (
      id, name, email
    )
  `)
  .where('published', 'eq', true)
  .where('category', 'in', ['tech', 'news'])
  .search(['title', 'content'], searchTerm)
  .sort('published_at', 'desc')
  .paginate({ page: 0, size: 20 });

const { data: posts } = useSupabaseQueryBuilder(postsWithAuthors);
// posts의 타입도 자동으로 추론됨!
```

## 🛡️ **타입 안전성의 이점**

### ✅ **컴파일 타임 에러 검출**

```typescript
// ❌ 이런 실수들이 컴파일 타임에 잡힘:
createSupabaseQuery('wrong_table')              // 존재하지 않는 테이블
  .select('wrong_column')                       // 존재하지 않는 컬럼  
  .where('id', 'eq', 'string_value')           // 타입 불일치
  .where('created_at', 'gt', 123)              // number를 string 필드에
  .sort('non_existent_column', 'asc');         // 존재하지 않는 컬럼

// ✅ IDE에서 자동완성과 타입 힌트 제공
createSupabaseQuery('tb_todolist')
  .select('|')  // ← 'id', 'created_at' 자동완성
  .where('|')   // ← 'id', 'created_at' 자동완성
  .sort('|');   // ← 'id', 'created_at' 자동완성
```

### 🚀 **개발 생산성 향상**

1. **실시간 타입 체크**: 코딩하면서 즉시 오류 발견
2. **자동완성**: IDE에서 가능한 컬럼명, 메서드 제안
3. **리팩토링 안전성**: 테이블 스키마 변경 시 관련 코드 자동 감지
4. **런타임 오류 방지**: 타입 불일치로 인한 버그 사전 차단

## 🔧 **내부 구현 원리**

### **왜 `any`를 제거할 수 있었나?**

```typescript
// 이전: 빈 Database 타입
Tables: { [_ in never]: never }  // 테이블이 없어서 any 필요

// 현재: 실제 테이블 타입  
Tables: { tb_todolist: { Row: {...}, Insert: {...}, Update: {...} } }

// 이제 TypeScript가 정확한 타입 추론 가능:
type TableName = keyof Database['public']['Tables'];  // 'tb_todolist'
const query = supabase.from('tb_todolist');          // 타입 안전!
```

### **타입 추론 체이닝**

```typescript
class SupabaseQueryBuilder<TTable extends TableName> {
  //                      ^^^^^^^^^^^^^^^^^^^^^^^^
  //                      테이블명을 제네릭으로 받아서
  
  where<K extends keyof Tables<TTable>>(
    column: K,  // ← 해당 테이블의 컬럼명만 허용
    operator: 'eq',
    value: Tables<TTable>[K]  // ← 해당 컬럼의 타입만 허용
  ) { ... }
}

// 사용 시:
createSupabaseQuery('tb_todolist')  // TTable = 'tb_todolist'
  .where('id', 'eq', 123)          // K = 'id', value는 number만 허용
  .where('created_at', 'eq', '2024-01-01')  // K = 'created_at', value는 string만 허용
```

이제 완전히 타입 안전한 Supabase Query Builder를 사용할 수 있습니다! 🎉
