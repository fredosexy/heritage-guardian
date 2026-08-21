import { AppProviders } from "./providers";
import { AppRoutes } from "./router";

const App = () => (
  <AppProviders>
    <AppRoutes />
  </AppProviders>
);

export default App;
