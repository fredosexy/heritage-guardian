import { AppProviders } from "./providers";
import { AppRoutes } from "./router";
import { ErrorBoundary } from "./ErrorBoundary";

const App = () => (
  <ErrorBoundary>
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  </ErrorBoundary>
);

export default App;
