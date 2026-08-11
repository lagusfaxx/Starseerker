"use client";

import { useRef, type ReactNode } from "react";
import { ChevronRightIcon } from "@/components/icons";

/**
 * Carrusel con scroll horizontal y anclaje. Sin librerías: usa el scroll nativo
 * y dos botones que desplazan el ancho visible.
 */
export function Carousel({
  children,
  itemClassName = "w-[78%] sm:w-[46%] lg:w-[24%]",
}: {
  children: ReactNode[];
  itemClassName?: string;
}) {
  const track = useRef<HTMLDivElement>(null);

  function scrollBy(direction: 1 | -1) {
    const node = track.current;
    if (!node) return;
    node.scrollBy({ left: direction * node.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={track}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children.map((child, index) => (
          <div key={index} className={`shrink-0 snap-start ${itemClassName}`}>
            {child}
          </div>
        ))}
      </div>

      {children.length > 1 && (
        <>
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Anterior"
            className="absolute top-1/2 -left-2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/70 text-bone backdrop-blur transition hover:bg-black lg:grid"
          >
            <ChevronRightIcon size={18} className="rotate-180" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label="Siguiente"
            className="absolute top-1/2 -right-2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/70 text-bone backdrop-blur transition hover:bg-black lg:grid"
          >
            <ChevronRightIcon size={18} />
          </button>
        </>
      )}
    </div>
  );
}
