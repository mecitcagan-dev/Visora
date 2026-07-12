"use client";

import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadImage, type GeneratedImage } from "@/lib/visora";

type Props = {
  image: GeneratedImage;
  className?: string;
  imgClassName?: string;
  alt?: string;
};

export function ClickableImage({
  image,
  className,
  imgClassName,
  alt,
}: Props) {
  return (
    <button
      type="button"
      onClick={() => downloadImage(image)}
      className={cn(
        "group relative block w-full cursor-pointer overflow-hidden rounded-xl border border-border text-left transition-all duration-200",
        "hover:scale-[1.02] hover:shadow-[0_12px_32px_rgba(18,22,28,0.10)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      title="İndirmek için tıkla"
      aria-label={`${alt ?? image.label} — indirmek için tıkla`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/png;base64,${image.data}`}
        alt={alt ?? image.label}
        className={cn("w-full object-cover", imgClassName)}
        draggable={false}
      />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-gradient-to-t from-black/55 to-transparent px-3 py-3 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
        <Download className="h-3.5 w-3.5" />
        İndirmek için tıkla
      </span>
    </button>
  );
}
