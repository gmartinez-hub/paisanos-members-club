"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { KeyRound, Mail, Send } from "lucide-react";
import { requestMagicLink } from "@/lib/actions";
import { DEMO_PASSWORD, roleFromEmail } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    if (password.trim()) {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const demoRole = roleFromEmail(email);

        if (demoRole && password === DEMO_PASSWORD) {
          window.location.href = `/demo?email=${encodeURIComponent(email)}`;
          return;
        }

        setStatus("error");
        setMessage(error.message);
        return;
      }

      window.location.href = "/club";
      return;
    }

    const result = await requestMagicLink(new FormData(event.currentTarget));

    if (!result.ok) {
      setStatus("error");
      setMessage(result.error ?? "No pudimos enviar el enlace de acceso.");
      return;
    }

    setStatus("sent");
    setMessage("Te mandamos el enlace de acceso. Revisa tu mail para abrir el Paisaporte.");
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-semibold text-runway">
        Mail de acceso
        <span className="flex items-center gap-2 rounded-sm border border-line bg-paper px-3 py-3 text-foreground">
          <Mail size={18} className="text-ink-muted" />
          <input
            className="w-full bg-transparent outline-none"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@email.com"
            required
          />
        </span>
      </label>

      <label className="grid gap-2 text-sm font-semibold text-runway">
        Clave QA o staff
        <span className="flex items-center gap-2 rounded-sm border border-line bg-paper px-3 py-3 text-foreground">
          <KeyRound size={18} className="text-ink-muted" />
          <input
            className="w-full bg-transparent outline-none"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Opcional"
          />
        </span>
      </label>

      <button
        className="flex h-12 items-center justify-center gap-2 rounded-sm bg-signal px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-signal-dark disabled:cursor-not-allowed disabled:opacity-60"
        disabled={status === "loading"}
        type="submit"
      >
        <Send size={18} />
        {status === "loading" ? "Enviando..." : password.trim() ? "Entrar con clave" : "Enviar magic link"}
      </button>

      {message ? (
        <p className={status === "error" ? "text-sm text-signal-dark" : "text-sm text-runway"}>
          {message}
        </p>
      ) : null}

      <p className="text-sm text-ink-muted">
        Si todavia no tenes acceso,{" "}
        <Link className="font-semibold text-signal-dark" href="/waitlist">
          pedi acceso
        </Link>
        .
      </p>

      <div className="grid gap-2 border-t border-line pt-4 sm:grid-cols-2">
        <Link
          className="rounded-sm border border-line px-3 py-3 text-center text-sm font-black text-runway transition hover:bg-background"
          href="/demo?role=member"
        >
          Demo miembro
        </Link>
        <Link
          className="rounded-sm border border-line px-3 py-3 text-center text-sm font-black text-runway transition hover:bg-background"
          href="/demo?role=admin"
        >
          Demo admin
        </Link>
      </div>
    </form>
  );
}
