// 개발 환경에서만 사용하는 디버깅 유틸리티
export const debugAuthConfig = () => {
  if (import.meta.env.DEV) {
    console.group('🔍 Auth Configuration Debug');
    
    console.log('Environment Variables:');
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
    console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
    
    console.log('\nRequired Format Check:');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl) {
      console.log('Supabase URL format:', supabaseUrl.includes('.supabase.co') ? '✅ Correct' : '❌ Invalid format');
    }
    
    console.log('\nGoogle OAuth Callback URL should be:');
    if (supabaseUrl) {
      console.log(`${supabaseUrl}/auth/v1/callback`);
    }
    
    console.groupEnd();
  }
};

// Supabase 프로바이더 상태 확인
export const testGoogleProvider = async () => {
  if (import.meta.env.DEV) {
    const { supabase } = await import('@/shared/api/supabase');
    
    console.group('🔍 Google Provider Test');
    
    try {
      // OAuth 테스트 (실제 리다이렉트 하지 않고 응답만 확인)
      const response = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          skipBrowserRedirect: true
        }
      });
      
      console.log('Google OAuth test response:', response);
      
      if (response.error) {
        console.error('❌ Google Provider Error:', response.error.message);
        
        if (response.error.message.includes('provider is not enabled')) {
          console.log('\n🚨 Solution: Enable Google provider in Supabase Dashboard');
          console.log('1. Go to Authentication > Providers');
          console.log('2. Enable "Google" provider');
          console.log('3. Add your Google Client ID and Secret');
          console.log('4. Save settings');
        }
      } else {
        console.log('✅ Google Provider is properly configured');
      }
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
    
    console.groupEnd();
  }
};
