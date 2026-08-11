"use client";

import { useState } from "react";

/**
 * Campo para pegar la URL de una imagen con vista previa inmediata: así se ve
 * si el enlace sirve antes de guardar.
 */
export function ImageUrlField({
  name,
  label,
  defaultValue = "",
  hint,
  previewClassName = "h-28 w-28",
}: {
  name: string;
  label: string;
  defaultValue?: string;
  hint?: string;
  previewClassName?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [broken, setBroken] = useState(false);

  return (
    <div>
      <label className="field-label" htmlFor={`img-${name}`}>
        {label}
      </label>
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <input
            id={`img-${name}`}
            name={name}
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              setBroken(false);
            }}
            placeholder="https://…/imagen.jpg"
            className="field"
          />
          {hint && <p className="mt-1.5 text-[11px] text-mute">{hint}</p>}
        </div>

        <div
          className={`${previewClassName} shrink-0 overflow-hidden rounded-lg border border-ink-line bg-ink`}
        >
          {url && !broken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setBroken(true)}
            />
          ) : (
            <div className="grid h-full place-items-center px-2 text-center text-[10px] text-mute">
              {broken ? "No carga" : "Sin imagen"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Lista de imágenes: una URL por línea, con vista previa de todas.
 * Se usa para la galería de la portada y para las fotos de cada producto.
 */
export function ImageListField({
  name,
  label,
  defaultValue = "",
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  hint?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const urls = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div>
      <label className="field-label" htmlFor={`imgs-${name}`}>
        {label}
      </label>
      <textarea
        id={`imgs-${name}`}
        name={name}
        rows={Math.min(10, Math.max(4, urls.length + 1))}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={"https://…/foto-1.jpg\nhttps://…/foto-2.jpg"}
        className="field font-mono text-xs"
      />
      <p className="mt-1.5 text-[11px] text-mute">
        {hint ?? "Una URL por línea. La primera es la imagen principal."}
      </p>

      {urls.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {urls.map((url, index) => (
            <li
              key={`${url}-${index}`}
              className="relative h-20 w-20 overflow-hidden rounded-lg border border-ink-line bg-ink"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <span className="absolute top-0 left-0 bg-black/70 px-1.5 py-0.5 text-[10px]">
                {index + 1}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
