import { Link, useLocation } from "react-router-dom";

export default function PageNotFound() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">404</p>
        <h1 className="mt-4 text-3xl font-semibold">Pagina no encontrada</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          La ruta <span className="font-medium text-foreground">{location.pathname}</span> no existe en este panel.
        </p>
        <Link className="mt-6 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" to="/">
          Volver al dashboard
        </Link>
      </div>
    </div>
  );
}
