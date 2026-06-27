"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup" | "forgot" | "reset";

const copy = {
  login: { title: "Volvé a tu cuenta", action: "Iniciar sesión" },
  signup: { title: "Creá tu cuenta", action: "Crear cuenta" },
  forgot: { title: "Recuperá tu acceso", action: "Enviar enlace" },
  reset: { title: "Elegí una nueva contraseña", action: "Actualizar contraseña" },
};

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setStatus(null);
    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        setStatus("Revisá tu email para confirmar la cuenta.");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const next = new URLSearchParams(window.location.search).get("next");
        router.replace(next?.startsWith("/") ? next : "/account");
        router.refresh();
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });
        if (error) throw error;
        setStatus("Te enviamos un enlace para crear una nueva contraseña.");
      } else {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setStatus("Contraseña actualizada.");
        router.replace("/account");
      }
    } catch {
      setStatus("No pudimos completar la acción. Revisá los datos e intentá de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md items-center px-4 py-12">
      <section className="w-full rounded-3xl border border-app-border bg-white p-6 shadow-xl shadow-app-primary/10">
        <Link href="/" className="text-sm font-semibold text-app-primary">🥚 Ventana Fértil</Link>
        <h1 className="mt-5 text-2xl font-bold text-app-foreground">{copy[mode].title}</h1>
        <p className="mt-2 text-sm text-app-muted">Tus datos sincronizados quedan protegidos por tu cuenta.</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          {mode !== "reset" && (
            <label className="block text-sm font-semibold">Email
              <input className="mt-2 min-h-12 w-full rounded-xl border border-app-border px-3" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
          )}
          {mode !== "forgot" && (
            <label className="block text-sm font-semibold">Contraseña
              <input className="mt-2 min-h-12 w-full rounded-xl border border-app-border px-3" type="password" minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
          )}
          <button disabled={pending} className="min-h-12 w-full rounded-xl bg-app-primary px-4 font-bold text-white disabled:opacity-60">
            {pending ? "Procesando…" : copy[mode].action}
          </button>
          {status && <p aria-live="polite" className="rounded-xl bg-app-background p-3 text-sm">{status}</p>}
        </form>
        <div className="mt-5 flex justify-between text-sm text-app-primary">
          {mode === "login" ? <><Link href="/forgot-password">Olvidé mi contraseña</Link><Link href="/signup">Crear cuenta</Link></> : <Link href="/login">Volver a iniciar sesión</Link>}
        </div>
      </section>
    </main>
  );
}
