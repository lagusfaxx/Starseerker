import Image from "next/image";
import { isVideoUrl } from "@/lib/media";

/**
 * Muestra una URL como imagen o como video según su extensión, de modo que en
 * cualquier campo del panel se pueda pegar una foto o un `.mp4` indistintamente.
 */
export function Media({
  url,
  alt = "",
  poster,
  priority,
  sizes = "100vw",
  className = "object-cover",
  controls = false,
}: {
  url: string;
  alt?: string;
  poster?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  controls?: boolean;
}) {
  if (!url) {
    return (
      <div className="grid h-full w-full place-items-center bg-ink-soft text-[11px] tracking-[0.2em] text-mute uppercase">
        Sin contenido
      </div>
    );
  }

  if (isVideoUrl(url)) {
    return (
      <video
        src={url}
        poster={poster || undefined}
        className={`h-full w-full ${className}`}
        autoPlay={!controls}
        muted
        loop={!controls}
        playsInline
        controls={controls}
        preload="metadata"
      />
    );
  }

  return (
    <Image src={url} alt={alt} fill priority={priority} sizes={sizes} className={className} />
  );
}
