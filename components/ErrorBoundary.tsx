import React, { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// FIX: Changed from extending the named import 'Component' to 'React.Component' to resolve an issue where the 'props' property was not being correctly inferred.
class ErrorBoundary extends React.Component<Props, State> {
  // FIX: Use class property for state initialization. This is a more modern syntax and resolves the "property 'state' does not exist" error.
  state: State = { hasError: false };

  static getDerivedStateFromError(_: Error): State {
    // Atualiza o estado para que a próxima renderização mostre a UI de fallback.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Você também pode registrar o erro em um serviço de relatórios de erro
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Você pode renderizar qualquer UI de fallback personalizada
      return (
        <div className="text-center p-8 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
          <p className="text-xl font-semibold text-red-400">Ocorreu um Erro Inesperado</p>
          <p className="text-md mt-2 text-gray-300">
            Algo deu errado ao carregar esta parte do aplicativo. Por favor, tente <button onClick={() => window.location.reload()} className="text-sky-400 hover:text-sky-300 underline font-semibold">atualizar a página</button>.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
