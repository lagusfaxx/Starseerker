"use client";

import Image from "next/image";
import { useState } from "react";

export type GalleryImage = { url: string; alt: string | null };

export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div className="lg:sticky lg:top-28">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
        {current ? (
          <Image
            src={current.url}
            alt={current.alt ?? name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-6"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-ink/40">Sin imagen</div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={image.url + index}
              onClick={() => setActive(index)}
              aria-label={`Ver imagen ${index + 1}`}
              className={`relative aspect-square overflow-hidden rounded-lg bg-white transition ${
                index === active ? "ring-2 ring-accent" : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt ?? `${name} ${index + 1}`}
                fill
                sizes="90px"
                className="object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
