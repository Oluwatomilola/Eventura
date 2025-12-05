'use client'

import { Component, ErrorInfo, ReactNode, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
            <div className="mx-auto max-w-md space-y-4">
              <div className="flex justify-center text-red-500">
                <AlertCircle className="h-12 w-12" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
              <p className="text-muted-foreground">
                We're sorry, but we encountered an error while loading this page.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 rounded-lg bg-muted/50 p-4 text-left text-sm">
                  <summary className="mb-2 cursor-pointer font-medium">Error details</summary>
                  <pre className="mt-2 overflow-auto rounded bg-background p-2 text-red-500">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              <div className="mt-6">
                <Button variant="outline" onClick={this.handleReset}>
                  Try again
                </Button>
              </div>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

// Create a hook for using error boundaries in function components
export const useErrorBoundary = () => {
  const [error, setError] = useState<Error | null>(null)

  if (error) {
    throw error
  }

  return setError
}

// Create a higher-order component for class components
export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  FallbackComponent?: React.ComponentType<{ error: Error; resetError: () => void }>,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) => {
  return class WithErrorBoundary extends Component<P, { hasError: boolean; error: Error | null }> {
    constructor(props: P) {
      super(props)
      this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error }
    }
    render() {
      return (
        <ErrorBoundary
          fallback={
            FallbackComponent ? (
              <FallbackComponent
                error={this.state?.error}
                resetError={() => this.setState({ hasError: false, error: null })}
              />
            ) : undefined
          }
          onError={onError}
        >
          <WrappedComponent {...this.props as P} />
        </ErrorBoundary>
      )
    }
  }
}
