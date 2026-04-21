import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

export default function UserNotRegisteredError() {
  const { authError, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      if (isSupabaseConfigured) {
        await signIn({ email, password });
      } else {
        await signIn();
      }
    } catch (error) {
      setErrorMessage(error.message ?? "No se pudo iniciar sesion.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Acceso</p>
        <h1 className="mt-4 text-3xl font-semibold text-foreground">
          {isSupabaseConfigured ? "Inicia sesion" : "Sesion no disponible"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {isSupabaseConfigured
            ? "Usa un correo y contrasena creados en Supabase para entrar al panel compartido."
            : "La app sigue funcionando en modo local. Puedes entrar al modo demo desde aqui."}
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {isSupabaseConfigured ? (
            <>
              <div>
                <Label>Email</Label>
                <Input
                  autoComplete="email"
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  value={email}
                />
              </div>
              <div>
                <Label>Contrasena</Label>
                <Input
                  autoComplete="current-password"
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  value={password}
                />
              </div>
            </>
          ) : null}

          {errorMessage || authError ? (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage || authError?.message}
            </p>
          ) : null}

          <div className="pt-2">
            <Button disabled={submitting} type="submit">
              {submitting ? "Entrando..." : isSupabaseConfigured ? "Entrar" : "Entrar al modo demo"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
