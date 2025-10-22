import { Component, ReactNode } from 'react';
import { logErrorToFirebase, toAppError, ErrorCategory, type AppError } from './errorHandling';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: AppError, reset: () => void) => ReactNode;
  category?: ErrorCategory;
  onError?: (error: AppError) => void;
  resetOnPropsChange?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary component with Firebase logging
 * Catches React errors and displays fallback UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Convert to AppError and log to Firebase
    const appError = toAppError(
      error, 
      this.props.category,
      {
        componentStack: errorInfo.componentStack?.substring(0, 500),
        source: 'ErrorBoundary'
      }
    );

    logErrorToFirebase(appError);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(appError);
    }

    this.setState({
      error: appError,
      errorInfo
    });

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error caught by boundary:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error state when props change (if enabled)
    if (this.props.resetOnPropsChange && this.state.hasError) {
      const propsChanged = Object.keys(this.props).some(
        key => key !== 'children' && this.props[key as keyof ErrorBoundaryProps] !== prevProps[key as keyof ErrorBoundaryProps]
      );
      
      if (propsChanged) {
        this.reset();
      }
    }
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Something went wrong
            </h2>
            
            <p className="text-gray-600 text-center mb-6">
              {this.state.error.userMessage}
            </p>

            {import.meta.env.DEV && this.state.error.message && (
              <div className="mb-4 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={this.reset}
                className="w-full px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Go to Home
              </button>
            </div>

            {import.meta.env.DEV && this.state.errorInfo?.componentStack && (
              <details className="mt-4">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                  Component Stack (Dev Only)
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-48">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary for functional components
 * Note: This is a wrapper that uses the class-based ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}


