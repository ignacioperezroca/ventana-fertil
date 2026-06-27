import { toAbsoluteUrl } from "@/lib/site";
import { safeShareText } from "@/lib/security";
import { buildGenericShareMessage, buildPersonalShareMessage } from "@/lib/shareTemplates";
import type { SimulationResult } from "@/types";

export const SHARE_TITLE = "🥚 Ventana Fértil | Simulador visual de ciclo y ovulación";
export const SHARE_DESCRIPTION =
  "Entendé tu ventana fértil, tus días de mayor atención y la incertidumbre real del ciclo. Herramienta educativa, privada y visual.";

export function getAppShareText() {
  return safeShareText("Estoy usando 🥚 Ventana Fértil, una herramienta visual para entender ciclo, ovulación e incertidumbre día por día.");
}

export function getAppShareUrl() {
  return toAbsoluteUrl("/");
}

export function getAppShareMessage() {
  return `${getAppShareText()}\n${getAppShareUrl()}`;
}

export function getPartnerSummaryText() {
  return safeShareText("Estoy usando 🥚 Ventana Fértil para entender mejor el ciclo y la ventana fértil estimada. La app muestra marcadores educativos por día y también aclara la incertidumbre del calendario.");
}

export function getPartnerContextText(contextLabel: string) {
  return `Estoy viendo este contexto general en Ventana Fértil: ${contextLabel}. No incluye fechas íntimas ni notas personales.`;
}

export function getShareImageUrl() {
  return toAbsoluteUrl("/og/ventana-fertil-og.png");
}

export function getGenericSharePayload() {
  return {
    title: SHARE_TITLE,
    text: buildGenericShareMessage(),
    url: getAppShareUrl(),
    imageUrl: getShareImageUrl(),
  };
}

export function getPublicShareText() {
  return buildGenericShareMessage();
}

export function getPublicSharePayload() {
  return {
    title: SHARE_TITLE,
    text: getPublicShareText(),
    url: getAppShareUrl(),
    imageUrl: getShareImageUrl(),
  };
}

export async function sharePublicApp() {
  const payload = getPublicSharePayload();
  if (typeof navigator !== "undefined" && navigator.share) {
    await navigator.share({
      title: payload.title,
      text: payload.text,
      url: payload.url,
    });
    return true;
  }
  return false;
}

export function buildWhatsAppMessage(simulation: SimulationResult) {
  return buildPersonalShareMessage(simulation);
}

export function getWhatsAppUrl(message: string) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export async function copyResultToClipboard(message: string) {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    throw new Error("El portapapeles no está disponible en este navegador.");
  }
  await navigator.clipboard.writeText(message);
  return message;
}

export async function copyShareText() {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    throw new Error("El portapapeles no está disponible en este navegador.");
  }
  const payload = getAppShareMessage();
  await navigator.clipboard.writeText(payload);
  return payload;
}

export async function copyShareUrl() {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    throw new Error("El portapapeles no está disponible en este navegador.");
  }
  const payload = getAppShareUrl();
  await navigator.clipboard.writeText(payload);
  return payload;
}

export async function shareApp() {
  const payload = getGenericSharePayload();
  if (typeof navigator !== "undefined" && navigator.share) {
    await navigator.share({
      title: payload.title,
      text: payload.text,
      url: payload.url,
    });
    return true;
  }
  return false;
}

export async function copyPartnerSummaryText() {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    throw new Error("El portapapeles no está disponible en este navegador.");
  }
  const payload = getPartnerSummaryText();
  await navigator.clipboard.writeText(payload);
  return payload;
}

export async function copyPartnerContextText(contextLabel: string) {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    throw new Error("El portapapeles no está disponible en este navegador.");
  }
  const payload = getPartnerContextText(contextLabel);
  await navigator.clipboard.writeText(payload);
  return payload;
}

export async function shareResult(message: string) {
  if (typeof navigator !== "undefined" && navigator.share) {
    await navigator.share({
      title: SHARE_TITLE,
      text: message,
      url: getAppShareUrl(),
    });
    return true;
  }
  return false;
}
