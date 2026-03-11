import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(err: unknown): State {
    return { hasError: true, message: err instanceof Error ? err.message : String(err) };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div style={{ padding: "1rem", color: "#e55", background: "#1a1a1a", borderRadius: 8 }}>
            <strong>渲染出错：</strong> {this.state.message}
            <br />
            <button
              style={{ marginTop: 8, cursor: "pointer" }}
              onClick={() => this.setState({ hasError: false, message: "" })}
            >
              重试
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
