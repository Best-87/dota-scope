/**
 * Configuración de Gemini AI para DotaScope.
 * Para producción usar variable de entorno VITE_GEMINI_KEY.
 * Para pruebas locales se puede hardcodear aquí.
 */

// Intenta primero la variable de entorno, luego localStorage, luego esta default
export const GEMINI_DEFAULT_KEY: string =
  (typeof import.meta !== 'undefined' && (import.meta as Record<string, unknown>).env
    ? ((import.meta as Record<string, Record<string, string>>).env['VITE_GEMINI_KEY'] ?? '')
    : '') ||
  (typeof localStorage !== 'undefined' ? (localStorage.getItem('dota_gemini_key') ?? '') : '') ||
  '';

export function saveGeminiKey(key: string): void {
  try { localStorage.setItem('dota_gemini_key', key); } catch { /* noop */ }
}

export function getStoredGeminiKey(): string {
  try {
    const stored = localStorage.getItem('dota_gemini_key');
    return stored && stored.trim().length > 0 ? stored.trim() : GEMINI_DEFAULT_KEY;
  } catch {
    return GEMINI_DEFAULT_KEY;
  }
}
