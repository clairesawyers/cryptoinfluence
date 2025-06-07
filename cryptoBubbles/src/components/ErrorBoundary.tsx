import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />;
      }

      return (
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-6 m-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <div>
              <h3 className="text-lg font-medium text-red-300">Something went wrong</h3>
              <p className="text-red-400 text-sm">An error occurred while rendering this component</p>
            </div>
          </div>
          
          {this.state.error && (
            <div className="mb-4">
              <div className="text-red-300 font-medium mb-2">Error Details:</div>
              <div className="bg-red-950/50 border border-red-800 rounded p-3 text-red-200 text-sm font-mono">
                {this.state.error.message}
              </div>
            </div>
          )}

          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details className="mt-4">
              <summary className="text-red-300 cursor-pointer text-sm">
                Stack Trace (Development Only)
              </summary>
              <pre className="bg-red-950/50 border border-red-800 rounded p-3 text-red-200 text-xs mt-2 overflow-auto">
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}