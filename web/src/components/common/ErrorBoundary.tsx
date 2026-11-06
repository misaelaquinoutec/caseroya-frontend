import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center bg-white rounded-xl border border-rose-100 shadow-xs m-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-full mb-3">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Ha ocurrido un error en la vista</h3>
          <p className="text-sm text-slate-500 max-w-md mt-1 mb-4">
            {this.state.error?.message || 'Error inesperado al renderizar el componente.'}
          </p>
          <Button
            onClick={this.handleReset}
            variant="primary"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Recargar Página
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
