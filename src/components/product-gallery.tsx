"use client";

import Image from "next/image";
import { useState } from "react";
import { isVideoUrl } from "@/lib/media";

export type GalleryImage = { url: string; alt: string | null };

export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-ink-soft">
        {current ? (
          isVideoUrl(current.url) ? (
            <video
              src={current.url}
              className="h-full w-full object-cover"
              controls
              playsInline
              preload="metadata"
            />
          ) : (
            <Image
              src={current.url}
              alt={current.alt ?? name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          )
        ) : (
          <div className="grid h-full place-items-center text-xs tracking-[0.2em] text-mute uppercase">
            Sin imagen
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={image.url + index}
              onClick={() => setActive(index)}
              aria-label={`Ver imagen ${index + 1} de ${images.length}`}
              aria-current={index === active}
              className={`relative aspect-square overflow-hidden rounded-lg bg-ink-soft transition ${
                index === active ? "ring-1 ring-accent" : "opacity-65 hover:opacity-100"
              }`}
            >
              {isVideoUrl(image.url) ? (
                <video
                  src={image.url}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <Image src={image.url} alt="" fill sizes="90px" className="object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
