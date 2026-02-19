import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import "./globals.css";

// Note: Colors are embedded in globals.css at build time
// No runtime palette loading needed!

// IMPORTANT: Primary error handlers (window.onerror, window.onunhandledrejection) are set up
// in index.html via a regular <script> tag. This is critical because ES module imports are
// evaluated BEFORE this file's body code runs, so errors during module initialization 
// (e.g., from unavailable packages) can only be caught by handlers registered before 
// module evaluation begins. The index.html handlers catch those module-level errors.
// The ErrorBoundary below catches React rendering errors.

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
