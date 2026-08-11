"use client";

import Image from "next/image";
import { useState } from "react";
import { isVideoUrl } from "@/lib/media";

export type GalleryImage = { url: string; alt: string | null };

export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  if (images.length === 0) {
    return (
      <div className="grid aspect-square place-items-center bg-ink-soft font-display text-xs tracking-[0.2em] text-mute uppercase">
        Sin imagen
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden bg-ink-soft">
        {isVideoUrl(current.url) ? (
          <video
            src={current.url}
            className="h-full w-full object-contain"
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
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-contain"
          />
        )}
      </div>

      {images.length > 1 && (
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.url + index}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Ver imagen ${index + 1} de ${images.length}`}
              aria-current={index === active}
              className={`relative h-20 w-20 shrink-0 border-2 bg-ink-soft transition-colors ${
                index === active ? "border-bone" : "border-transparent hover:border-ink-line"
              }`}
            >
              {isVideoUrl(image.url) ? (
                <video
                  src={image.url}
                  className="h-full w-full object-contain"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <Image src={image.url} alt="" fill sizes="120px" className="object-contain" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
