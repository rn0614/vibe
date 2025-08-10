# Supabase 타입 설정 가이드

## 🚀 설정 순서

### 1. 환경 변수 설정

`.env` 파일을 생성하고 Supabase 프로젝트 정보를 입력하세요:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Supabase CLI 로그인

```bash
npm run supabase:login
```

### 3. 프로젝트 연결 및 타입 생성

```bash
# Supabase 프로젝트 ID를 환경변수로 설정
export PROJECT_ID=your-project-id

# 또는 Windows에서:
set PROJECT_ID=your-project-id

# 타입 생성
npm run supabase:types
```

### 4. 타입 파일 확인

생성된 `src/shared/types/database.ts` 파일을 확인하고, 실제 DB 스키마가 반영되었는지 확인하세요.

## 📝 사용 방법

### 기본 사용법

```typescript
import { supabase } from '@/shared/api/supabase';
import type { Database, Tables } from '@/shared/types/database';

// 타입 안전한 쿼리
const { data: users } = await supabase
  .from('users')
  .select('*')
  .returns<Tables<'users'>[]>();

// 타입 안전한 삽입
const newUser: TablesInsert<'users'> = {
  email: 'user@example.com',
  name: 'John Doe'
};

const { data } = await supabase
  .from('users')
  .insert(newUser)
  .select()
  .single();
```

### 에러 처리

```typescript
import { ApiException } from '@/shared/api/client';
import { isAuthError } from '@/shared/types/api';

try {
  const result = await authApi.signIn(email, password);
} catch (error) {
  if (error instanceof ApiException) {
    console.log('Status:', error.status);
    console.log('Code:', error.code);
    console.log('Message:', error.message);
    console.log('Hint:', error.hint); // Supabase 특화 힌트
  }
}
```

## 🔄 타입 업데이트

DB 스키마 변경 후 타입을 업데이트하려면:

```bash
npm run supabase:types
```

## 💡 팁

1. **자동 타입 생성**: DB 스키마 변경 시마다 `npm run supabase:types`를 실행하세요.
2. **타입 안전성**: 모든 Supabase 쿼리에서 생성된 타입을 활용하세요.
3. **에러 처리**: `ApiException`을 사용해 일관된 에러 처리를 구현하세요.
4. **IDE 지원**: TypeScript의 IntelliSense를 최대한 활용하세요.

## 🚨 주의사항

- `database.ts` 파일은 자동 생성되므로 수동 편집하지 마세요.
- 환경변수가 제대로 설정되었는지 확인하세요.
- Supabase 프로젝트의 권한 설정을 확인하세요.
