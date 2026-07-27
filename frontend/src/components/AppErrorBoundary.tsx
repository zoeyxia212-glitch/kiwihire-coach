import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

export default class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("KiwiHire Coach page error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-error-page">
          <div className="panel">
            <div className="panel-inner">
              <p className="eyebrow">Something went wrong</p>
              <h1>We could not display this page.</h1>
              <p className="muted">
                Your saved information has not been deleted. Reload the
                page, or return to the dashboard and try again.
              </p>
              <div className="form-actions">
                <button
                  className="button primary"
                  type="button"
                  onClick={() => window.location.reload()}
                >
                  Reload page
                </button>
                <a className="button" href="/">
                  Return to dashboard
                </a>
              </div>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
