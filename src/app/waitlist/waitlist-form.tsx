"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const initialForm = {
  full_name: "",
  email: "",
  company: "",
  reason: "",
};

export function WaitlistForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.from("whitelist_requests").insert(form);

    if (error) {
      setStatus("error");
      setMessage(
        error.code === "23505"
          ? "Ese email ya esta en la lista."
          : "No pudimos guardar la solicitud. Proba de nuevo.",
      );
      return;
    }

    setStatus("sent");
    setForm(initialForm);
    setMessage("Listo. Tu solicitud quedo registrada para revision del equipo.");
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Nombre"
          value={form.full_name}
          onChange={(value) => setForm((current) => ({ ...current, full_name: value }))}
          placeholder="Tu nombre"
        />
        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => setForm((current) => ({ ...current, email: value }))}
          placeholder="tu@email.com"
        />
      </div>

      <Field
        label="Empresa / proyecto"
        value={form.company}
        onChange={(value) => setForm((current) => ({ ...current, company: value }))}
        placeholder="Que estas construyendo"
      />

      <label className="grid gap-2 text-sm font-semibold text-runway">
        Por que queres entrar
        <textarea
          className="min-h-32 resize-none rounded-sm border border-line bg-paper px-3 py-3 text-foreground outline-none transition focus:border-runway"
          maxLength={300}
          minLength={10}
          value={form.reason}
          onChange={(event) =>
            setForm((current) => ({ ...current, reason: event.target.value }))
          }
          placeholder="Contanos en 1 o 2 lineas que podrias aportar o buscar dentro del club."
          required
        />
      </label>

      <button
        className="flex h-12 items-center justify-center gap-2 rounded-sm bg-signal px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-signal-dark disabled:cursor-not-allowed disabled:opacity-60"
        disabled={status === "loading"}
        type="submit"
      >
        <Send size={18} />
        {status === "loading" ? "Guardando..." : "Pedir invitacion"}
      </button>

      {message ? (
        <p className={status === "error" ? "text-sm text-signal-dark" : "text-sm text-runway"}>
          {message}
        </p>
      ) : null}
    </form>
  );
}

function Field({
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-runway">
      {label}
      <input
        className="rounded-sm border border-line bg-paper px-3 py-3 text-foreground outline-none transition focus:border-runway"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required
      />
    </label>
  );
}
