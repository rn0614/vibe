import { AuthInitializer } from "./providers/auth";
import { QueryProvider } from "./providers/query";
import { AppRouter } from "./providers/router";
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
