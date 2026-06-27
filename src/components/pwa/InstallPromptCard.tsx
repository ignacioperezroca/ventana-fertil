"use client";

import { Download, Smartphone, X } from "lucide-react";
import { useEffect, useState } from "react";

import { trackEvent } from "@/lib/analytics";

const DISMISS_KEY = "ventana-fertil:install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function safeGetItem(key: string) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage issues.
  }
}

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  const standalone = window.matchMedia?.("(display-mode: standalone)")?.matches;
  const iosStandalone = Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return Boolean(standalone || iosStandalone);
}

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 900 || window.matchMedia?.("(pointer: coarse)")?.matches;
}

export function InstallPromptCard() {
  const [dismissed, setDismissed] = useState(() => safeGetItem(DISMISS_KEY) === "true");
  const [open, setOpen] = useState(false);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const visible = isMobileViewport() && !dismissed && !isStandaloneMode();

  if (!visible) return null;

  const handleOpen = () => {
    setOpen((current) => !current);
    trackEvent("install_prompt_clicked", { source: "install_prompt_card", hasResult: false, isDemo: false, eventVersion: "g1" });
  };

  const handleDismiss = () => {
    setDismissed(true);
    safeSetItem(DISMISS_KEY, "true");
  };

  const handleInstall = async () => {
    if (!promptEvent) {
      setOpen(true);
      return;
    }

    try {
      await promptEvent.prompt();
      const result = await promptEvent.userChoice;
      if (result.outcome === "accepted") {
        trackEvent("install_prompt_clicked", {
          source: "install_prompt_card",
          hasResult: false,
          isDemo: false,
          eventVersion: "g1",
        });
      }
    } catch {
      // Ignore install prompt failures. The manual instructions remain visible.
    }
  };

  const isIos = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

  return (
    <section className="rounded-[30px] border border-app-border bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,249,244,0.92)_100%)] p-4 shadow-[0_22px_70px_-44px_rgba(36,22,47,0.32)] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Instalación</p>
          <h3 className="mt-2 text-xl font-semibold text-app-foreground">Usala como app</h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">Guardá Ventana Fértil en tu pantalla de inicio para tenerla siempre a mano.</p>
        </div>
        <div className="rounded-2xl border border-app-border bg-white p-3 text-app-primary">
          <Smartphone className="size-5" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleOpen}
          className="vf-press inline-flex h-11 items-center justify-center rounded-full bg-app-primary px-4 text-sm font-semibold text-white transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-app-primary/20"
        >
          Ver cómo
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="vf-press inline-flex h-11 items-center justify-center rounded-full border border-app-border bg-white px-4 text-sm font-semibold text-app-foreground transition hover:border-app-primary/30 focus:outline-none focus:ring-2 focus:ring-app-primary/15"
        >
          No ahora
        </button>
      </div>

      {open ? (
        <div className="mt-4 rounded-[24px] border border-app-border bg-white p-4">
          {isIos ? (
            <p className="text-sm leading-6 text-app-muted">En iPhone: tocá Compartir y elegí Agregar a inicio.</p>
          ) : (
            <p className="text-sm leading-6 text-app-muted">
              Si tu navegador lo permite, tocá Instalar app. Si no, podés abrir el menú y elegir Agregar a pantalla de inicio.
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleInstall}
              className="vf-press inline-flex h-11 items-center justify-center rounded-full bg-app-primary px-4 text-sm font-semibold text-white transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-app-primary/20"
            >
              <Download className="mr-2 size-4" />
              {promptEvent ? "Instalar app" : "Ver paso a paso"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="vf-press inline-flex h-11 items-center justify-center rounded-full border border-app-border bg-white px-4 text-sm font-semibold text-app-foreground transition hover:border-app-primary/30 focus:outline-none focus:ring-2 focus:ring-app-primary/15"
            >
              <X className="mr-2 size-4" />
              Cerrar
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
