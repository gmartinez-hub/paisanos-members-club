"use client";

import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { Camera, Keyboard, ScanLine, Square } from "lucide-react";
import { checkInScannedPassport } from "@/lib/actions";
import { AdminPrimaryButton } from "@/components/ui";

type BarcodeDetectorShape = {
  detect(input: CanvasImageSource | HTMLVideoElement): Promise<Array<{ rawValue: string }>>;
};

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorShape;

type DetectorWindow = Window & {
  BarcodeDetector?: BarcodeDetectorConstructor;
};

export function ScanForm({ eventId }: { eventId: string }) {
  const [cameraState, setCameraState] = useState<"idle" | "active" | "unsupported" | "error">("idle");
  const [message, setMessage] = useState("");
  const [manualValue, setManualValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const scanningLockRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  async function startCamera() {
    setMessage("");

    const Detector = (window as DetectorWindow).BarcodeDetector;
    if (!Detector || !navigator.mediaDevices?.getUserMedia) {
      setCameraState("unsupported");
      setMessage("Camara no disponible en este navegador. Usa carga manual.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const detector = new Detector({ formats: ["qr_code"] });
      scanningLockRef.current = false;
      setCameraState("active");
      scanFrame(detector);
    } catch {
      setCameraState("error");
      setMessage("No pudimos abrir la camara. Revisa permisos o usa carga manual.");
    }
  }

  function stopCamera() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraState("idle");
  }

  function scanFrame(detector: BarcodeDetectorShape) {
    rafRef.current = requestAnimationFrame(async () => {
      const video = videoRef.current;

      if (!video || scanningLockRef.current) {
        scanFrame(detector);
        return;
      }

      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        try {
          const [code] = await detector.detect(video);
          if (code?.rawValue) {
            scanningLockRef.current = true;
            stopCamera();
            submitValue(code.rawValue);
            return;
          }
        } catch {
          setCameraState("error");
          setMessage("No pudimos leer el QR. Proba acercar el Paisaporte o usa carga manual.");
          stopCamera();
          return;
        }
      }

      scanFrame(detector);
    });
  }

  function submitValue(qrValue: string) {
    const formData = new FormData();
    formData.set("event_id", eventId);
    formData.set("qr_value", qrValue);

    startTransition(() => {
      void checkInScannedPassport(formData).then((result) => {
        setMessage(result.ok ? "Entrada registrada." : result.error ?? "No pudimos registrar la entrada.");
        if (result.ok) {
          setManualValue("");
        }
        scanningLockRef.current = false;
      });
    });
  }

  function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitValue(manualValue);
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-sm border border-a-line bg-runway p-3 text-paper">
        <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-paper/15 bg-black">
          <video
            className="h-full w-full object-cover"
            muted
            playsInline
            ref={videoRef}
          />
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="grid size-40 place-items-center rounded-sm border border-stamp">
              <ScanLine className="text-stamp" size={32} />
            </div>
          </div>
          {cameraState !== "active" ? (
            <div className="absolute inset-0 grid place-items-center bg-runway/92 p-5 text-center">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-stamp">
                  Scanner
                </p>
                <p className="mt-2 text-sm font-black text-paper/90">
                  Escanear Paisaporte
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {cameraState === "active" ? (
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-paper/20 px-4 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-paper transition-colors hover:bg-paper hover:text-runway"
              onClick={stopCamera}
              type="button"
            >
              <Square size={16} />
              Detener
            </button>
          ) : (
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-stamp px-4 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-stamp-fg transition-colors hover:bg-paper"
              disabled={isPending}
              onClick={startCamera}
              type="button"
            >
              <Camera size={16} />
              Abrir camara
            </button>
          )}
        </div>
      </section>

      <form className="grid gap-3 rounded-sm border border-a-line bg-paper p-4" onSubmit={handleManualSubmit}>
        <label className="grid gap-2 text-sm font-black text-a-ink">
          Carga manual
          <span className="flex items-center gap-2 rounded-sm border border-a-line bg-background px-3 py-3">
            <Keyboard className="text-a-ink/45" size={18} />
            <input
              autoComplete="off"
              className="w-full bg-transparent text-sm outline-none placeholder:text-a-ink/35"
              onChange={(event) => setManualValue(event.target.value)}
              placeholder="/p/..."
              required
              value={manualValue}
            />
          </span>
        </label>
        <AdminPrimaryButton disabled={isPending || !manualValue.trim()}>
          <ScanLine size={16} />
          Registrar check-in
        </AdminPrimaryButton>
      </form>

      {message ? (
        <p className={`rounded-sm border px-3 py-3 text-sm font-semibold ${
          message === "Entrada registrada."
            ? "border-a-sag bg-a-sag text-a-sag-t"
            : "border-a-mal bg-a-mal text-a-mal-t"
        }`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
