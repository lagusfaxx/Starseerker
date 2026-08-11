/** Detecta si una URL apunta a un video para renderizarlo como tal. */
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogv", ".ogg", ".mov", ".m4v"];

export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  const clean = url.split("?")[0].split("#")[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((extension) => clean.endsWith(extension));
}
