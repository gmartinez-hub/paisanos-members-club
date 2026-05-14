import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const results = [];
const env = loadEnv();
const online = process.argv.includes("--online");

checkPublicSupabaseUrl();
checkPublicSupabaseKey();
checkServiceRoleKey();
checkAppUrl();
checkQaPassword();
checkOptionalIntegrations();

if (online) {
  await checkSupabaseAdminApi();
}

printSummary();

const hasFailures = results.some((result) => result.level === "fail");
process.exit(hasFailures ? 1 : 0);

function loadEnv() {
  const merged = { ...process.env };
  const envPath = resolve(process.cwd(), ".env.local");

  if (!existsSync(envPath)) {
    add("fail", ".env.local", "No existe .env.local.");
    return merged;
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [key, ...rest] = trimmed.split("=");
    if (!merged[key]) {
      merged[key] = rest.join("=").replace(/^['"]|['"]$/g, "");
    }
  }

  add("pass", ".env.local", "Archivo encontrado.");
  return merged;
}

function checkPublicSupabaseUrl() {
  const value = env.NEXT_PUBLIC_SUPABASE_URL;

  if (!value) {
    add("fail", "NEXT_PUBLIC_SUPABASE_URL", "Falta la URL publica del proyecto.");
    return;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !url.hostname.endsWith(".supabase.co")) {
      add("fail", "NEXT_PUBLIC_SUPABASE_URL", "Debe ser una URL https de Supabase.");
      return;
    }
  } catch {
    add("fail", "NEXT_PUBLIC_SUPABASE_URL", "No es una URL valida.");
    return;
  }

  add("pass", "NEXT_PUBLIC_SUPABASE_URL", "Formato correcto.");
}

function checkPublicSupabaseKey() {
  const value = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!value) {
    add("fail", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "Falta la publishable key.");
    return;
  }

  if (looksLikePlaceholder(value) || value.length < 40) {
    add("fail", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "Parece placeholder o esta incompleta.");
    return;
  }

  if (!value.startsWith("sb_publishable_") && !value.startsWith("eyJ")) {
    add("warn", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "No tiene prefijo esperado, revisar que sea anon/publishable.");
    return;
  }

  add("pass", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "Formato plausible.");
}

function checkServiceRoleKey() {
  const value = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!value) {
    add("fail", "SUPABASE_SERVICE_ROLE_KEY", "Falta la key server-side para admin/seed.");
    return;
  }

  if (value.startsWith("sbp_")) {
    add("fail", "SUPABASE_SERVICE_ROLE_KEY", "Es un account access token, no una service role key del proyecto.");
    return;
  }

  if (looksLikePlaceholder(value) || value.length < 40) {
    add("fail", "SUPABASE_SERVICE_ROLE_KEY", "Parece placeholder o esta incompleta.");
    return;
  }

  if (!value.startsWith("sb_secret_") && !value.startsWith("eyJ")) {
    add("warn", "SUPABASE_SERVICE_ROLE_KEY", "No tiene prefijo esperado, revisar en Supabase Project Settings > API.");
    return;
  }

  add("pass", "SUPABASE_SERVICE_ROLE_KEY", "Formato plausible.");
}

function checkAppUrl() {
  const value = env.NEXT_PUBLIC_APP_URL;

  if (!value) {
    add("fail", "NEXT_PUBLIC_APP_URL", "Falta la URL base de la app.");
    return;
  }

  try {
    new URL(value);
  } catch {
    add("fail", "NEXT_PUBLIC_APP_URL", "No es una URL valida.");
    return;
  }

  add("pass", "NEXT_PUBLIC_APP_URL", "Formato correcto.");
}

function checkQaPassword() {
  const value = env.QA_SEED_PASSWORD;

  if (!value) {
    add("warn", "QA_SEED_PASSWORD", "Falta; el seed usara el default.");
    return;
  }

  if (value.length < 12) {
    add("warn", "QA_SEED_PASSWORD", "Existe, pero conviene que tenga 12+ caracteres.");
    return;
  }

  add("pass", "QA_SEED_PASSWORD", "Configurada.");
}

function checkOptionalIntegrations() {
  if (!env.LUMA_API_KEY) {
    add("warn", "LUMA_API_KEY", "Falta; OK para P0 si Luma queda como enlace externo.");
  } else {
    add("pass", "LUMA_API_KEY", "Configurada.");
  }

  if (!env.LUMA_WEBHOOK_SECRET) {
    add("warn", "LUMA_WEBHOOK_SECRET", "Falta; OK hasta conectar webhook real.");
  } else {
    add("pass", "LUMA_WEBHOOK_SECRET", "Configurada.");
  }

  if (!env.NEXT_PUBLIC_POSTHOG_KEY) {
    add("warn", "NEXT_PUBLIC_POSTHOG_KEY", "Falta; analytics queda para P1.");
  } else {
    add("pass", "NEXT_PUBLIC_POSTHOG_KEY", "Configurada.");
  }
}

async function checkSupabaseAdminApi() {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key || looksLikePlaceholder(key) || key.length < 40) {
    add("fail", "Supabase Admin API", "No se prueba online porque falta una service role key plausible.");
    return;
  }

  const supabase = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });

  if (error) {
    add("fail", "Supabase Admin API", `La Admin API rechazo la key: ${error.message}.`);
    return;
  }

  add("pass", "Supabase Admin API", "Key aceptada por Auth Admin.");
}

function looksLikePlaceholder(value) {
  return value.includes("...") || value.includes("<") || value.includes(">");
}

function add(level, name, message) {
  results.push({ level, name, message });
}

function printSummary() {
  const icon = {
    fail: "FAIL",
    pass: "OK",
    warn: "WARN",
  };

  console.log("");
  console.log("P0 config check");
  console.log("");

  for (const result of results) {
    console.log(`${icon[result.level]}  ${result.name}: ${result.message}`);
  }

  console.log("");
  console.log("Tip: usa `npm run verify:p0 -- --online` para validar Supabase Auth Admin sin escribir datos.");
  console.log("");
}
