import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  // Safely access location with fallback in case context isn't ready
  let location;
  try {
    location = useLocation();
  } catch (error) {
    // If router context isn't available yet, use fallback
    console.warn("Router context not ready, using fallback pathname");
    location = { pathname: window.location.pathname };
  }

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
