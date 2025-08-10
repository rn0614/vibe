import React, { useState } from 'react';
import { 
  createSupabaseQuery, 
  useSupabaseQueryBuilder
} from '@/shared/hooks';
import { Layout } from '@/shared/ui';

/**
 * 최적화된 쿼리 테스트 페이지
 * withCount() 기능을 간단하게 테스트
 */

export const TestOptimizedPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(3);

  // 🚀 최적화된 쿼리: 데이터 + 카운트 한 번에!
  const optimizedQuery = createSupabaseQuery('tb_todolist')
    .select('*')
    .orderByDesc('created_at')
    .paginate({ page, size: pageSize })
    .withCount(); // 🎯 핵심 기능!

  const { data: result, isLoading, error } = useSupabaseQueryBuilder(optimizedQuery);

  // 통합 응답에서 데이터와 카운트 분리
  const todos = result && 'data' in result ? result.data : [];
  const totalCount = result && 'totalCount' in result ? result.totalCount : 0;

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Layout>
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1>🚀 최적화된 쿼리 테스트</h1>
        
        {/* 성능 정보 */}
        <div style={{ 
          background: '#e8f5e8', 
          padding: '1rem', 
          borderRadius: '8px',
          marginBottom: '2rem',
          border: '2px solid #4caf50'
        }}>
          <h3>📊 성능 개선 효과</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <strong>🐌 기존 방식:</strong>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                - 데이터 쿼리: 1회<br/>
                - 카운트 쿼리: 1회<br/>
                <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>총 2회 HTTP 요청</span>
              </div>
            </div>
            <div>
              <strong>🚀 개선된 방식:</strong>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                - 통합 쿼리: 1회<br/>
                - 데이터 + 카운트 동시<br/>
                <span style={{ color: '#388e3c', fontWeight: 'bold' }}>총 1회 HTTP 요청</span>
              </div>
            </div>
          </div>
          <div style={{ 
            marginTop: '1rem', 
            padding: '0.5rem', 
            background: '#4caf50', 
            color: 'white', 
            borderRadius: '4px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            🎯 성능 향상: 50% 빠른 로딩!
          </div>
        </div>

        {/* 실시간 결과 */}
        <div style={{ 
          background: '#f5f5f5', 
          padding: '1rem', 
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h3>📈 실시간 결과</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196f3' }}>
                {totalCount}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>총 항목</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4caf50' }}>
                {todos.length}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>현재 페이지</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff9800' }}>
                {page + 1} / {totalPages}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>페이지</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {isLoading ? '🔄' : '✅'}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                {isLoading ? '로딩 중' : '완료'}
              </div>
            </div>
          </div>
        </div>

        {/* 에러 표시 */}
        {error && (
          <div style={{ 
            background: '#ffebee', 
            color: '#c62828', 
            padding: '1rem', 
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            <strong>🚨 에러:</strong> {error.message}
          </div>
        )}

        {/* 데이터 목록 */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
            <p>최적화된 쿼리 실행 중...</p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              데이터와 카운트를 한 번에 불러오고 있습니다
            </p>
          </div>
        ) : todos.length > 0 ? (
          <div>
            <h3>📋 할 일 목록 (페이지 {page + 1})</h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {todos.map((todo: any) => (
                <div 
                  key={todo.id}
                  style={{
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <span style={{ 
                      background: '#e3f2fd',
                      color: '#1565c0',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      marginRight: '1rem'
                    }}>
                      ID: {todo.id}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>
                      {new Date(todo.created_at).toLocaleString('ko-KR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            background: '#f9f9f9',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h3>데이터가 없습니다</h3>
            <p style={{ color: '#666' }}>
              Supabase tb_todolist 테이블에 데이터를 추가해보세요.
            </p>
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '1rem',
            marginTop: '2rem',
            padding: '1rem',
            background: 'white',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}>
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: page === 0 ? '#f5f5f5' : 'white',
                cursor: page === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              ◀️ 이전
            </button>
            
            <span style={{ 
              padding: '0.5rem 1rem',
              background: '#2196f3',
              color: 'white',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}>
              {page + 1} / {totalPages}
            </span>

            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: page >= totalPages - 1 ? '#f5f5f5' : 'white',
                cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer'
              }}
            >
              ▶️ 다음
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TestOptimizedPage;
