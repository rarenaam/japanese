import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      // Prepare error details for AI fix
      const errorDetails = JSON.stringify({
        message: this.state.error?.toString(),
        stack: this.state.error?.stack,
        componentStack: this.state.errorInfo?.componentStack,
      });
      
      return (
        <div style={{
          padding: "20px",
          fontFamily: "monospace",
          backgroundColor: "#1a1a1a",
          color: "#ff4444",
          minHeight: "100vh",
          overflow: "auto",
        }}>
          <h1 style={{ color: "#ff4444", marginBottom: "20px" }}>
            ⚠️ Application Error
          </h1>
          
          <div style={{
            backgroundColor: "#2a2a2a",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "20px",
            border: "1px solid #ff4444",
          }}>
            <h2 style={{ color: "#ffaa44", marginTop: 0 }}>Error Message:</h2>
            <pre style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              color: "#ffffff",
            }}>
              {this.state.error?.toString()}
            </pre>
          </div>

          {this.state.error?.stack && (
            <div style={{
              backgroundColor: "#2a2a2a",
              padding: "15px",
              borderRadius: "5px",
              marginBottom: "20px",
              border: "1px solid #ff4444",
            }}>
              <h2 style={{ color: "#ffaa44", marginTop: 0 }}>Stack Trace:</h2>
              <pre style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontSize: "12px",
                color: "#cccccc",
              }}>
                {this.state.error.stack}
              </pre>
            </div>
          )}

          {this.state.errorInfo && (
            <div style={{
              backgroundColor: "#2a2a2a",
              padding: "15px",
              borderRadius: "5px",
              marginBottom: "20px",
              border: "1px solid #ff4444",
            }}>
              <h2 style={{ color: "#ffaa44", marginTop: 0 }}>Component Stack:</h2>
              <pre style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontSize: "12px",
                color: "#cccccc",
              }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 20px",
                backgroundColor: "#2563EB",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                // Send error to parent window (Episolo IDE)
                window.parent.postMessage({
                  type: 'EPISOLO_ERROR',
                  error: JSON.parse(errorDetails)
                }, '*');
              }}
              style={{
                padding: "10px 20px",
                backgroundColor: "#059669",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Fix with AI
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

