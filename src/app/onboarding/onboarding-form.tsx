"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const initialForm = {
  full_name: "",
  role: "",
  company: "",
  location: "Buenos Aires",
  focus: "",
  skills: "",
  building: "",
  looking_for: "",
  can_help_with: "",
  open_to: "",
  availability: "",
  linkedin_url: "",
};

export function OnboardingForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.push("/login");
      return;
    }

    const payload = {
      user_id: user.id,
      full_name: form.full_name,
      role: form.role,
      company: form.company,
      location: form.location,
      focus: form.focus,
      skills: form.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      building: form.building,
      looking_for: form.looking_for
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      can_help_with: form.can_help_with,
      open_to: form.open_to,
      availability: form.availability || "A coordinar",
      last_interaction: "Paisaporte activado",
      linkedin_url: form.linkedin_url || null,
      qr_base_url: `${window.location.origin}/p/${user.id}`,
    };

    const { error: profileError } = await supabase.from("profiles").insert(payload);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    router.push("/club");
    router.refresh();
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Nombre completo"
          value={form.full_name}
          onChange={(value) => setForm((current) => ({ ...current, full_name: value }))}
        />
        <Field
          label="Rol"
          value={form.role}
          onChange={(value) => setForm((current) => ({ ...current, role: value }))}
        />
      </div>

      <Field
        label="Empresa / proyecto"
        value={form.company}
        onChange={(value) => setForm((current) => ({ ...current, company: value }))}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Ubicacion"
          value={form.location}
          onChange={(value) => setForm((current) => ({ ...current, location: value }))}
        />
        <Field
          label="Foco actual"
          value={form.focus}
          onChange={(value) => setForm((current) => ({ ...current, focus: value }))}
        />
      </div>
      <Field
        label="Skills, separadas por coma"
        value={form.skills}
        onChange={(value) => setForm((current) => ({ ...current, skills: value }))}
      />
      <Field
        label="Que estas construyendo"
        value={form.building}
        onChange={(value) => setForm((current) => ({ ...current, building: value }))}
        maxLength={140}
      />
      <Field
        label="En que podes ayudar"
        value={form.can_help_with}
        onChange={(value) => setForm((current) => ({ ...current, can_help_with: value }))}
      />
      <Field
        label="Que buscas en el club, separado por coma"
        value={form.looking_for}
        onChange={(value) => setForm((current) => ({ ...current, looking_for: value }))}
      />
      <Field
        label="A que estas abierto"
        value={form.open_to}
        onChange={(value) => setForm((current) => ({ ...current, open_to: value }))}
      />
      <Field
        label="Disponibilidad"
        value={form.availability}
        onChange={(value) => setForm((current) => ({ ...current, availability: value }))}
      />
      <Field
        label="LinkedIn"
        required={false}
        type="url"
        value={form.linkedin_url}
        onChange={(value) => setForm((current) => ({ ...current, linkedin_url: value }))}
      />

      <button
        className="flex h-12 items-center justify-center gap-2 rounded-sm bg-signal px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-signal-dark disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        <BadgeCheck size={18} />
        {loading ? "Activando..." : "Activar Paisaporte"}
      </button>

      {error ? <p className="text-sm text-signal-dark">{error}</p> : null}
    </form>
  );
}

function Field({
  label,
  maxLength,
  onChange,
  required = true,
  type = "text",
  value,
}: {
  label: string;
  maxLength?: number;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-runway">
      {label}
      <input
        className="rounded-sm border border-line bg-paper px-3 py-3 text-foreground outline-none transition focus:border-runway"
        maxLength={maxLength}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  );
}
