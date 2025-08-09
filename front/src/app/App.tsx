import { QueryProvider, AppRouter, AuthInitializer } from "./providers";
import "@/shared/styles/global.scss";

function App() {
  return (
    <QueryProvider>
      <AuthInitializer>
        <AppRouter />
      </AuthInitializer>
    </QueryProvider>
  );
}

export default App;
