"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  /** header | hero | icon */
  variant?: "header" | "hero" | "icon";
  priority?: boolean;
  /** Empty string when a nearby heading already names the brand (a11y). */
  alt?: string;
};

const SIZES = {
  header: { width: 160, height: 28, className: "h-7 w-auto md:h-8" },
  hero: {
    width: 520,
    height: 92,
    className: "h-16 w-auto sm:h-[4.5rem] md:h-20",
  },
  icon: { width: 64, height: 50, className: "h-10 w-auto" },
} as const;

export function BrandLogo({
  className,
  variant = "header",
  priority = false,
  alt = "Visora",
}: BrandLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const size = SIZES[variant];

  if (variant === "icon") {
    return (
      <Image
        src="/brand/visora-iko.png"
        alt={alt}
        width={size.width}
        height={size.height}
        priority={priority}
        className={cn(size.className, "object-contain", className)}
      />
    );
  }

  // Avoid hydration flash: default to light wordmark until mounted
  const src =
    mounted && resolvedTheme === "dark"
      ? "/brand/visora-logo-dark.png"
      : "/brand/visora-logo-light.png";

  return (
    <Image
      src={src}
      alt={alt}
      width={size.width}
      height={size.height}
      priority={priority}
      className={cn(size.className, "object-contain object-left", className)}
    />
  );
}
