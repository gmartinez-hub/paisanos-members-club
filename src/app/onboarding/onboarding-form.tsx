"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { activateProfile } from "@/lib/actions";

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

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.set(key, value));

    const result = await activateProfile(formData);

    if (!result.ok) {
      setError(result.error ?? "No pudimos crear tu Paisaporte.");
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
          autoComplete="name"
          label="Nombre visible"
          placeholder="Sofia Alvarez"
          value={form.full_name}
          onChange={(value) => setForm((current) => ({ ...current, full_name: value }))}
        />
        <Field
          autoComplete="organization-title"
          label="Rol u oficio"
          placeholder="Founder, PM, designer..."
          value={form.role}
          onChange={(value) => setForm((current) => ({ ...current, role: value }))}
        />
      </div>

      <Field
        autoComplete="organization"
        label="Proyecto o compania"
        placeholder="Ruta Labs"
        value={form.company}
        onChange={(value) => setForm((current) => ({ ...current, company: value }))}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          autoComplete="address-level2"
          label="Ubicacion"
          placeholder="Buenos Aires"
          value={form.location}
          onChange={(value) => setForm((current) => ({ ...current, location: value }))}
        />
        <Field
          label="Foco actual"
          placeholder="Conseguir los primeros clientes"
          value={form.focus}
          onChange={(value) => setForm((current) => ({ ...current, focus: value }))}
        />
      </div>
      <Field
        label="Habilidades"
        placeholder="Producto, ventas, AI, operaciones"
        value={form.skills}
        onChange={(value) => setForm((current) => ({ ...current, skills: value }))}
      />
      <Field
        label="Que estas construyendo"
        placeholder="Un copiloto de ventas para equipos B2B"
        value={form.building}
        onChange={(value) => setForm((current) => ({ ...current, building: value }))}
        maxLength={140}
      />
      <Field
        label="Que podes aportar"
        placeholder="Discovery, GTM, automatizacion, research"
        value={form.can_help_with}
        onChange={(value) => setForm((current) => ({ ...current, can_help_with: value }))}
      />
      <Field
        label="Que estas buscando"
        placeholder="Beta testers, advisors, clientes, talento"
        value={form.looking_for}
        onChange={(value) => setForm((current) => ({ ...current, looking_for: value }))}
      />
      <Field
        label="Que tipo de cruces te sirven"
        placeholder="Demos tempranas, cafes, notas, presentaciones"
        value={form.open_to}
        onChange={(value) => setForm((current) => ({ ...current, open_to: value }))}
      />
      <Field
        label="Disponibilidad"
        placeholder="Viernes por la tarde o mañanas de la semana"
        value={form.availability}
        onChange={(value) => setForm((current) => ({ ...current, availability: value }))}
      />
      <Field
        autoComplete="url"
        label="Link publico / LinkedIn"
        placeholder="https://linkedin.com/in/tu-nombre"
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
        {loading ? "Creando..." : "Crear Paisaporte"}
      </button>

      {error ? <p className="text-sm text-signal-dark">{error}</p> : null}
    </form>
  );
}

function Field({
  autoComplete,
  label,
  maxLength,
  onChange,
  placeholder,
  required = true,
  type = "text",
  value,
}: {
  autoComplete?: string;
  label: string;
  maxLength?: number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-runway">
      {label}
      <input
        className="rounded-sm border border-line bg-paper px-3 py-3 text-foreground outline-none transition focus:border-runway"
        autoComplete={autoComplete}
        maxLength={maxLength}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  );
}
