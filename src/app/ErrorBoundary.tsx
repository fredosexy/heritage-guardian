import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  failed: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Do not log dossier contents, personal data, tokens, or stack traces here.
    console.error("Application render failure");
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="min-h-screen bg-background px-4 flex items-center justify-center">
        <section className="card-soft w-full max-w-md p-6 text-center space-y-4" role="alert">
          <h1 className="text-title">Une erreur a interrompu l’affichage</h1>
          <p className="text-sm text-muted-foreground">
            Vos données enregistrées n’ont pas été supprimées. Rechargez l’application pour reprendre.
          </p>
          <button
            type="button"
            className="rounded-xl bg-primary px-4 py-2 text-primary-foreground"
            onClick={() => window.location.reload()}
          >
            Recharger
          </button>
        </section>
      </main>
    );
  }
}
