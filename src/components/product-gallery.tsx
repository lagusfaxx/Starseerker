"use client";

import Image from "next/image";
import { useState } from "react";

export type GalleryImage = { url: string; alt: string | null };

export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div className="lg:sticky lg:top-40 lg:self-start">
      <div className="flex gap-3">
        {images.length > 1 && (
          <div className="hidden w-[72px] shrink-0 flex-col gap-2 sm:flex">
            {images.map((image, index) => (
              <button
                key={image.url + index}
                onClick={() => setActive(index)}
                aria-label={`Ver imagen ${index + 1} de ${images.length}`}
                aria-current={index === active}
                className={`relative aspect-square border bg-white transition ${
                  index === active ? "border-bone" : "border-ink-line hover:border-[#55555f]"
                }`}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="72px"
                  className="object-contain p-1.5"
                />
              </button>
            ))}
          </div>
        )}

        <div className="relative aspect-square min-w-0 flex-1 border border-ink-line bg-white">
          {current ? (
            <Image
              src={current.url}
              alt={current.alt ?? name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-contain p-8"
            />
          ) : (
            <div className="grid h-full place-items-center text-xs tracking-wider text-ink/30 uppercase">
              Sin imagen
            </div>
          )}
        </div>
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2 sm:hidden">
          {images.map((image, index) => (
            <button
              key={image.url + index}
              onClick={() => setActive(index)}
              aria-label={`Ver imagen ${index + 1}`}
              className={`relative aspect-square border bg-white ${
                index === active ? "border-bone" : "border-ink-line"
              }`}
            >
              <Image src={image.url} alt="" fill sizes="70px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
