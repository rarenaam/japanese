import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext.tsx"; // Toegevoegd
import { BrowserRouter } from "react-router-dom";      // Toegevoegd

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </ErrorBoundary>
);
