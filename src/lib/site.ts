export const FALLBACK_SITE_URL = "https://ventana-fertil.vercel.app";

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VITE_PUBLIC_SITE_URL?.trim() ||
    FALLBACK_SITE_URL
  ).replace(/\/$/, "");
}

export function toAbsoluteUrl(pathname = "/") {
  return new URL(pathname, `${getSiteUrl()}/`).toString();
}
