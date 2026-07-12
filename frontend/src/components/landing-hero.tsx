"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WIKI = "https://commons.wikimedia.org/wiki/Special:FilePath";

/** Wider centers so full polaroid (image+caption) doesn't cover neighbors */
const ARTWORKS = [
  {
    title: "Yıldızlı Gece",
    artist: "Vincent van Gogh",
    caption: "1889, gece göğüne dair ölümsüz bir bakış",
    file: "Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
    rotate: -7,
    x: -380,
    y: 28,
    hideOnMobile: true,
  },
  {
    title: "Kanagawa'da Büyük Dalga",
    artist: "Katsushika Hokusai",
    caption: "Ukiyo-e geleneğinin en tanınan baskısı",
    file: "The_Great_Wave_off_Kanagawa.jpg",
    rotate: -3.5,
    x: -190,
    y: 10,
    hideOnMobile: false,
  },
  {
    title: "İnci Küpeli Kız",
    artist: "Johannes Vermeer",
    caption: "Hollanda'nın Mona Lisa'sı olarak anılır",
    file: "Meisje_met_de_parel.jpg",
    rotate: 0,
    x: 0,
    y: 0,
    hideOnMobile: false,
  },
  {
    title: "Öpücük",
    artist: "Gustav Klimt",
    caption: "Altın çağının en simgesel eseri",
    file: "Gustav_Klimt_016.jpg",
    rotate: 3.5,
    x: 190,
    y: 10,
    hideOnMobile: false,
  },
  {
    title: "Mona Lisa",
    artist: "Leonardo da Vinci",
    caption: "Sanat tarihinin en gizemli gülümsemesi",
    file: "Mona_Lisa,_by_Leonardo_da_Vinci,_from_C2RMF_retouched.jpg",
    rotate: 7,
    x: 380,
    y: 28,
    hideOnMobile: true,
  },
] as const;

function wikiSrc(file: string) {
  return `${WIKI}/${file}?width=640`;
}

export function LandingHero({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-6 md:px-8",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
      >
        <div className="h-[30rem] w-[30rem] rounded-full bg-primary/5 blur-3xl dark:bg-primary/[0.12] sm:h-[40rem] sm:w-[40rem]" />
      </div>

      <div className="flex w-full max-w-5xl flex-col items-center">
        <div
          className="relative mx-auto mb-8 h-[19rem] w-full sm:mb-10 sm:h-[22rem] md:h-[26rem]"
          role="list"
          aria-label="Ünlü sanat eserleri"
        >
          {ARTWORKS.map((art, index) => (
            <div
              key={art.title}
              role="listitem"
              className={cn(
                "absolute bottom-2 left-1/2 w-[8.5rem] sm:w-[9.75rem] md:w-[10.5rem]",
                art.hideOnMobile && "hidden sm:block",
                "motion-safe:transition-transform motion-safe:duration-200",
                "motion-safe:hover:scale-[1.03] motion-reduce:hover:scale-100"
              )}
              style={{
                zIndex: index === 2 ? 5 : 3 - Math.abs(index - 2),
                transform: `translate(calc(-50% + ${art.x}px), ${art.y}px)`,
              }}
            >
              <figure
                className={cn(
                  "rounded-lg bg-card p-2.5 pb-3 shadow-[0_8px_28px_rgba(18,22,28,0.07)]",
                  "motion-safe:transition-[box-shadow] motion-safe:duration-200",
                  "motion-safe:hover:shadow-[0_12px_32px_rgba(18,22,28,0.10)]"
                )}
                style={{ transform: `rotate(${art.rotate}deg)` }}
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
                  <Image
                    src={wikiSrc(art.file)}
                    alt={`${art.title} — ${art.artist}`}
                    fill
                    sizes="(max-width: 640px) 40vw, 200px"
                    className="object-cover"
                    priority={index >= 1 && index <= 3}
                  />
                </div>
                <figcaption className="mt-2.5 px-0.5 text-left">
                  <p className="text-[0.8rem] font-semibold leading-snug text-card-foreground sm:text-[0.85rem]">
                    {art.title}
                    <span className="font-medium text-muted-foreground">
                      {" "}
                      — {art.artist}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[0.75rem] leading-snug text-muted-foreground italic">
                    {art.caption}
                  </p>
                </figcaption>
              </figure>
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-2xl text-center">
          <div className="flex flex-col items-center">
            {/* Decorative wordmark; brand name exposed via single page h1 */}
            <BrandLogo variant="hero" priority alt="" />
            <h1 className="sr-only">Visora</h1>
          </div>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground md:mt-6 md:text-xl">
            Basit bir cümleden, stil ve ışıkla zenginleştirilmiş blog kapak
            görselleri — tarayıcıda üret, tıkla, indir.
          </p>
          <div className="mt-8 flex justify-center md:mt-10">
            <Link
              href="/uretim"
              className={cn(buttonVariants({ size: "lg" }), "rounded-xl")}
            >
              Üretmeye başla
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
