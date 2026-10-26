/**
 * JSON-LD is embedded inside an HTML script element. Escaping HTML-sensitive
 * characters ensures a string value cannot terminate that script element.
 * Escapes remain valid JSON and are decoded by JSON.parse / search engines.
 */
export function serializeJsonLd(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
