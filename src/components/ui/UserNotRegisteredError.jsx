import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";

export default function UserNotRegisteredError() {
  const { signIn } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Acceso</p>
        <h1 className="mt-4 text-3xl font-semibold text-foreground">Sesion no disponible</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Esta version funciona en modo local. Si cerraste la sesion de demo, puedes restaurarla y seguir usando el panel.
        </p>
        <div className="mt-6">
          <Button onClick={() => signIn()}>Entrar al modo demo</Button>
        </div>
      </div>
    </div>
  );
}
