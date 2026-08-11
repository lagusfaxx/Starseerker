'use client';

import { useRef, useState } from 'react';

/**
 * Campo de video con subida desde el equipo.
 *
 * Es el hermano de `ImageField`, pero no se puede reutilizar aquel: un video
 * pesa un orden de magnitud mas, se previsualiza con `<video>` y no admite los
 * mismos formatos. Ademas de subir un archivo se puede pegar un enlace, que es
 * lo unico que habia antes.
 *
 * Subir el archivo es lo recomendable y no por comodidad: un video propio se
 * reproduce con `<video>`, que no dibuja ningun control. Un enlace de YouTube
 * o Vimeo obliga a incrustar su reproductor, y ese decide por su cuenta cuando
 * mostrar su interfaz encima.
 */
export function VideoField({
  name,
  label,
  defaultValue = '',
  hint,
  error,
  onChange,
}: {
  /** Campo oculto que viaja en el formulario. Se omite si el padre ya guarda la URL. */
  name?: string;
  label: string;
  defaultValue?: string;
  hint?: string;
  error?: string;
  onChange?: (url: string) => void;
}) {
  const [url, setUrlState] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // Un aviso no es un error: el video se subio y funciona, pero conviene saber
  // que va a ir lento o a tardar en arrancar.
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function setUrl(next: string) {
    setUrlState(next);
    onChange?.(next);
  }

  async function upload(file: File) {
    setUploading(true);
    setMessage(null);
    setNotice(null);

    try {
      const body = new FormData();
      body.append('file', file);
      body.append('kind', 'video');

      const response = await fetch('/api/admin/media', { method: 'POST', body });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error ?? 'No se pudo subir el video.');
        return;
      }
      setUrl(data.url);
      if (data.warning) setNotice(data.warning);
    } catch {
      // Un video tarda, y una subida cortada a medio camino se ve igual que un
      // fallo de red: conviene decir las dos cosas.
      setMessage('No se pudo subir el video. Revisa tu conexion e intentalo de nuevo.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  // Un archivo propio se puede previsualizar aqui mismo; un enlace de YouTube
  // no, porque habria que incrustar su reproductor dentro del formulario.
  const isFile = /\.(mp4|webm)$/i.test(url) || url.startsWith('/api/media/');

  return (
    <div>
      <span className="label">{label}</span>
      {name ? <input type="hidden" name={name} value={url} /> : null}

      <div className="mt-2 flex flex-wrap items-start gap-4">
        <div className="flex h-24 w-44 shrink-0 items-center justify-center overflow-hidden border border-sand-dark bg-sand">
          {url && isFile ? (
            <video
              key={url}
              src={url}
              muted
              loop
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="px-2 text-center text-[11px] uppercase tracking-widest text-ink-muted">
              {url ? 'Enlace externo' : 'Sin video'}
            </span>
          )}
        </div>

        <div className="min-w-56 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="btn-ghost btn-sm"
            >
              {uploading ? 'Subiendo...' : url ? 'Reemplazar' : 'Subir video'}
            </button>
            {url ? (
              <button type="button" onClick={() => setUrl('')} className="btn-ghost btn-sm">
                Quitar
              </button>
            ) : null}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/webm"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
          />

          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="o pega un enlace de YouTube, Vimeo o un .mp4"
            className="field py-2 text-xs"
          />
        </div>
      </div>

      {uploading ? (
        <span className="mt-1.5 block text-xs text-ink-muted">
          Subiendo el video. Puede tardar un poco; no cierres esta pagina.
        </span>
      ) : null}
      {notice ? (
        <span className="mt-1.5 block border-l-2 border-amber-400 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
          {notice}
        </span>
      ) : null}
      {message ? <span className="error-text">{message}</span> : null}
      {error ? <span className="error-text">{error}</span> : null}
      {!message && !error && !uploading && !notice && hint ? (
        <span className="mt-1.5 block text-xs text-ink-muted">{hint}</span>
      ) : null}
    </div>
  );
}
