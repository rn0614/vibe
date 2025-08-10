// 실제 DB 연결 전까지 사용할 샘플 Database 타입
// 실제 프로젝트에서는 'npm run supabase:types'로 생성된 타입을 사용하세요

export interface SampleDatabase {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          user_id: string;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          user_id: string;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
          published?: boolean;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// 편의를 위한 타입 alias들
export type SampleTables<T extends keyof SampleDatabase['public']['Tables']> = SampleDatabase['public']['Tables'][T]['Row'];
export type SampleTablesInsert<T extends keyof SampleDatabase['public']['Tables']> = SampleDatabase['public']['Tables'][T]['Insert'];
export type SampleTablesUpdate<T extends keyof SampleDatabase['public']['Tables']> = SampleDatabase['public']['Tables'][T]['Update'];

// 사용 예시:
// type User = SampleTables<'users'>;
// type NewUser = SampleTablesInsert<'users'>;
// type UserUpdate = SampleTablesUpdate<'users'>;
