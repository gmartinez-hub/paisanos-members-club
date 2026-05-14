"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { updateProfile } from "@/lib/actions";
import type { ProfileRow } from "@/lib/community";

type ProfileForm = {
  availability: string;
  building: string;
  can_help_with: string;
  company: string;
  focus: string;
  full_name: string;
  linkedin_url: string;
  location: string;
  looking_for: string;
  open_to: string;
  role: string;
  skills: string;
};

export function PassportEditForm({ profile }: { profile: ProfileRow }) {
  const router = useRouter();
  const initialForm = useMemo<ProfileForm>(
    () => ({
      availability: profile.availability,
      building: profile.building ?? "",
      can_help_with: profile.can_help_with,
      company: profile.company,
      focus: profile.focus,
      full_name: profile.full_name,
      linkedin_url: profile.linkedin_url ?? "",
      location: profile.location,
      looking_for: profile.looking_for.join(", "),
      open_to: profile.open_to,
      role: profile.role,
      skills: profile.skills.join(", "),
    }),
    [profile],
  );
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.set(key, value));

    const result = await updateProfile(formData);

    if (!result.ok) {
      setError(result.error ?? "No pudimos guardar tu Paisaporte.");
      setSaving(false);
      return;
    }

    router.push("/passport");
    router.refresh();
  }

  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      <FormSection title="Identidad">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre" value={form.full_name} onChange={(value) => update("full_name", value)} />
          <Field label="Rol u oficio" value={form.role} onChange={(value) => update("role", value)} />
          <Field label="Proyecto o compania" value={form.company} onChange={(value) => update("company", value)} />
          <Field label="Ubicacion" value={form.location} onChange={(value) => update("location", value)} />
        </div>
      </FormSection>

      <FormSection title="Contexto actual">
        <Field label="Foco actual" value={form.focus} onChange={(value) => update("focus", value)} />
        <TextArea
          label="Que estas construyendo"
          maxLength={180}
          value={form.building}
          onChange={(value) => update("building", value)}
        />
      </FormSection>

      <FormSection title="Cruces y aportes">
        <Field
          helper="Separado por comas."
          label="Que estas buscando"
          value={form.looking_for}
          onChange={(value) => update("looking_for", value)}
        />
        <Field
          helper="Separado por comas."
          label="Habilidades"
          value={form.skills}
          onChange={(value) => update("skills", value)}
        />
        <TextArea
          label="Que podes aportar"
          value={form.can_help_with}
          onChange={(value) => update("can_help_with", value)}
        />
        <TextArea
          label="Que tipo de cruces te sirven"
          value={form.open_to}
          onChange={(value) => update("open_to", value)}
        />
      </FormSection>

      <FormSection title="Disponibilidad y link">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Disponibilidad" value={form.availability} onChange={(value) => update("availability", value)} />
          <Field
            label="LinkedIn o link publico"
            required={false}
            type="url"
            value={form.linkedin_url}
            onChange={(value) => update("linkedin_url", value)}
          />
        </div>
      </FormSection>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-runway px-4 font-sans text-sm font-black text-stamp transition hover:opacity-88 disabled:cursor-not-allowed disabled:opacity-55"
          disabled={saving}
          type="submit"
        >
          <Save size={17} />
          {saving ? "Guardando..." : "Guardar Paisaporte"}
        </button>
        {error ? <p className="text-sm font-semibold text-signal-dark">{error}</p> : null}
      </div>
    </form>
  );
}

function FormSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="grid gap-4 border-t border-line pt-5">
      <h3 className="text-2xl font-black">{title}</h3>
      {children}
    </section>
  );
}

function Field({
  helper,
  label,
  onChange,
  required = true,
  type = "text",
  value,
}: {
  helper?: string;
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-foreground">
      {label}
      <input
        className="rounded-sm border border-line bg-paper px-3 py-3 text-foreground outline-none transition focus:border-runway"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
      {helper ? <span className="text-xs font-semibold text-ink-muted">{helper}</span> : null}
    </label>
  );
}

function TextArea({
  label,
  maxLength = 260,
  onChange,
  value,
}: {
  label: string;
  maxLength?: number;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-foreground">
      {label}
      <textarea
        className="min-h-28 resize-none rounded-sm border border-line bg-paper px-3 py-3 text-foreground outline-none transition focus:border-runway"
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        required
        value={value}
      />
    </label>
  );
}
