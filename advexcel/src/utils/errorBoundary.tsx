import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log error to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      // Send error to logging service
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // In production, send to your error tracking service
      console.log('Error logged:', { error: error.message, stack: error.stack, componentStack: errorInfo.componentStack });
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleClearStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear storage:', error);
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. This could be due to a temporary issue or corrupted data.
            </p>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={this.handleReload}
                className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh Page</span>
              </button>
              
              <button
                onClick={this.handleClearStorage}
                className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Clear Data & Refresh</span>
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>Go to Homepage</span>
              </button>
            </div>

            <div className="text-sm text-gray-500 mb-4">
              <p>If the problem persists, try:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Clearing your browser cache</li>
                <li>Disabling browser extensions</li>
                <li>Using an incognito/private window</li>
                <li>Trying a different browser</li>
              </ul>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Technical Details (Development Mode)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}