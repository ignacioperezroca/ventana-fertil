export function sanitizePlainText(value: string, maxLength = 2000) {
  return value.replace(/\u0000/g, "").slice(0, maxLength);
}

export function escapeIcsText(text: string) {
  return sanitizePlainText(text)
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

export function safeShareText(text: string) {
  return sanitizePlainText(text, 4000);
}
