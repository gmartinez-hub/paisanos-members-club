"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Mail, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/club`,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage("Te mandamos un magic link. Revisá tu mail para entrar al club.");
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-semibold text-runway">
        Email
        <span className="flex items-center gap-2 rounded-sm border border-line bg-paper px-3 py-3 text-foreground">
          <Mail size={18} className="text-ink-muted" />
          <input
            className="w-full bg-transparent outline-none"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@email.com"
            required
          />
        </span>
      </label>

      <button
        className="flex h-12 items-center justify-center gap-2 rounded-sm bg-signal px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-signal-dark disabled:cursor-not-allowed disabled:opacity-60"
        disabled={status === "loading"}
        type="submit"
      >
        <Send size={18} />
        {status === "loading" ? "Enviando..." : "Entrar con magic link"}
      </button>

      {message ? (
        <p className={status === "error" ? "text-sm text-signal-dark" : "text-sm text-runway"}>
          {message}
        </p>
      ) : null}

      <p className="text-sm text-ink-muted">
        Si todavia no tenes invitacion,{" "}
        <Link className="font-semibold text-signal-dark" href="/waitlist">
          pedi acceso aca
        </Link>
        .
      </p>
    </form>
  );
}
