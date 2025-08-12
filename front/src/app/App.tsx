import { AuthInitializer } from "./providers/auth";
import { QueryProvider } from "./providers/query";
import { AppRouter } from "./routers";
import "@/app/styles/global.scss";

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
