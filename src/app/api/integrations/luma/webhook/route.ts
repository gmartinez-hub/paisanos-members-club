import { NextResponse } from "next/server";
import { extractLumaEventId, isLumaWebhookConfigured, verifyLumaWebhookSignature } from "@/lib/luma";
import { upsertLumaGuestFromWebhook } from "@/lib/luma-sync";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isLumaWebhookConfigured()) {
    return NextResponse.json({ error: "Luma webhook no configurado." }, { status: 503 });
  }

  const signature = request.headers.get("webhook-signature") ?? "";
  const webhookId = request.headers.get("webhook-id") ?? "";
  const rawBody = await request.text();

  if (!verifyLumaWebhookSignature(signature, rawBody)) {
    return NextResponse.json({ error: "Firma invalida." }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role no configurada." }, { status: 503 });
  }

  const payload = JSON.parse(rawBody) as Record<string, unknown>;
  const eventType = typeof payload.type === "string" ? payload.type : "unknown";
  const data = payload.data && typeof payload.data === "object" ? payload.data as Record<string, unknown> : {};
  const lumaEventId =
    extractLumaEventId(JSON.stringify(data)) ||
    extractLumaEventId(typeof payload.event_id === "string" ? payload.event_id : "");

  await supabase.from("luma_webhook_events").upsert(
    {
      event_type: eventType,
      luma_event_id: lumaEventId || null,
      payload,
      webhook_id: webhookId || crypto.randomUUID(),
    },
    { onConflict: "webhook_id" },
  );

  if (lumaEventId) {
    const { data: event } = await supabase
      .from("events")
      .select("id,luma_event_id")
      .eq("luma_event_id", lumaEventId)
      .maybeSingle();

    if (event?.id) {
      await supabase
        .from("events")
        .update({
          luma_last_webhook_at: new Date().toISOString(),
          luma_sync_error: null,
        })
        .eq("id", event.id);

      if (eventType.includes("guest") || eventType.includes("ticket")) {
        await upsertLumaGuestFromWebhook(event.id as string, lumaEventId, data.guest ?? data);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
