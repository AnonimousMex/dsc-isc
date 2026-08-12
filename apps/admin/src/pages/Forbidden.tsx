import { Link } from 'react-router-dom';

export default function Forbidden() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">Error 403</p>
      <h1 className="text-2xl font-bold text-ink">No tienes permiso para ver esta pantalla</h1>
      <p className="max-w-sm text-sm text-muted">
        Esta sección está reservada para roles con más privilegios. Si crees que es un error,
        contacta a un administrador.
      </p>
      <Link to="/" className="mt-2 text-sm font-medium text-primary hover:underline">
        Volver al dashboard
      </Link>
    </div>
  );
}
