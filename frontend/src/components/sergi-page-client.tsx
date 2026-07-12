"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Layers } from "lucide-react";
import { carouselGeometry } from "@/lib/carousel-geometry";
import { useGallery } from "@/components/gallery-provider";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import "./gallery-3d.css";

const RESUME_DELAY_MS = 1800;
const DRAG_SENSITIVITY = 0.45;
/** Arrow-key rotation step (degrees) — one notch toward next card feel */
const KEYBOARD_STEP_DEG = 18;
/** Degrees per second — matches former 32s / 1turn spin */
const AUTO_SPEED_DEG = 360 / 32;
const REDUCED_SPEED_DEG = 360 / 128;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function SergiPageClient() {
  const { gallery } = useGallery();
  const n = gallery.length;
  const reducedMotion = usePrefersReducedMotion();
  const { stepDeg, startDeg, radiusEm } = carouselGeometry(n);

  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);

  const sceneRef = useRef<HTMLDivElement | null>(null);
  const nRef = useRef(n);
  const rotationRef = useRef(0);
  const autoSpinRef = useRef(true);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const resumeTimerRef = useRef<number | null>(null);

  nRef.current = n;

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current != null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (n <= 1) {
      autoSpinRef.current = false;
      return;
    }
    autoSpinRef.current = !draggingRef.current;
  }, [n]);

  useEffect(() => {
    if (n <= 1) return;

    let raf = 0;
    let last = performance.now();
    const speed = reducedMotion ? REDUCED_SPEED_DEG : AUTO_SPEED_DEG;

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (autoSpinRef.current && !draggingRef.current) {
        rotationRef.current += speed * dt;
        setRotation(rotationRef.current);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [n, reducedMotion]);

  const pauseAutoAndResume = useCallback(() => {
    autoSpinRef.current = false;
    clearResumeTimer();
    resumeTimerRef.current = window.setTimeout(() => {
      autoSpinRef.current = true;
      resumeTimerRef.current = null;
    }, RESUME_DELAY_MS);
  }, [clearResumeTimer]);

  const rotateBy = useCallback(
    (deltaDeg: number) => {
      if (nRef.current <= 1) return;
      pauseAutoAndResume();
      rotationRef.current += deltaDeg;
      setRotation(rotationRef.current);
    },
    [pauseAutoAndResume]
  );

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || n <= 1) return;

    const onPointerDown = (event: PointerEvent) => {
      if (nRef.current <= 1) return;
      try {
        scene.setPointerCapture(event.pointerId);
      } catch {
        /* synthetic / already captured */
      }
      draggingRef.current = true;
      autoSpinRef.current = false;
      clearResumeTimer();
      lastXRef.current = event.clientX;
      setDragging(true);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!draggingRef.current || nRef.current <= 1) return;
      const dx = event.clientX - lastXRef.current;
      lastXRef.current = event.clientX;
      rotationRef.current += dx * DRAG_SENSITIVITY;
      setRotation(rotationRef.current);
    };

    const endDrag = (event: PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setDragging(false);
      try {
        scene.releasePointerCapture(event.pointerId);
      } catch {
        /* already released */
      }
      pauseAutoAndResume();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (nRef.current <= 1) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        rotateBy(KEYBOARD_STEP_DEG);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        rotateBy(-KEYBOARD_STEP_DEG);
      } else if (event.key === "Home") {
        event.preventDefault();
        pauseAutoAndResume();
        rotationRef.current = 0;
        setRotation(0);
      }
    };

    scene.addEventListener("pointerdown", onPointerDown);
    scene.addEventListener("pointermove", onPointerMove);
    scene.addEventListener("pointerup", endDrag);
    scene.addEventListener("pointercancel", endDrag);
    scene.addEventListener("keydown", onKeyDown);

    return () => {
      scene.removeEventListener("pointerdown", onPointerDown);
      scene.removeEventListener("pointermove", onPointerMove);
      scene.removeEventListener("pointerup", endDrag);
      scene.removeEventListener("pointercancel", endDrag);
      scene.removeEventListener("keydown", onKeyDown);
      clearResumeTimer();
    };
  }, [n, clearResumeTimer, pauseAutoAndResume, rotateBy]);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto flex min-h-[calc(100dvh-4.5rem)] max-w-6xl flex-col px-4 pb-16 pt-8 md:px-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Sergi
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Bu oturumda ürettiğiniz görsellerin 3D sergisi. Sürükleyerek veya
          odaklandıktan sonra ok tuşlarıyla döndürebilirsiniz. İndirme için
          Galeriye gidin.
        </p>

        {n === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-10">
            <div className="w-full max-w-md rounded-2xl border border-dashed border-border bg-card/60 px-8 py-12 text-center shadow-[0_8px_28px_rgba(18,22,28,0.07)]">
              <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
                <Layers className="h-6 w-6" />
              </span>
              <p className="text-foreground">Henüz görsel üretmediniz.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Üretim sayfasından bir görsel oluşturun; burada 3D olarak
                dönecekler.
              </p>
              <Link
                href="/uretim"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-6 inline-flex rounded-xl"
                )}
              >
                Hemen Üret
              </Link>
            </div>
          </div>
        ) : (
          <div
            ref={sceneRef}
            className="scene mt-12 h-[28rem] w-full md:h-[34rem] rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            data-dragging={dragging ? "true" : "false"}
            data-static={n === 1 ? "true" : "false"}
            role="region"
            tabIndex={n > 1 ? 0 : undefined}
            aria-roledescription="3D sergi"
            aria-label={
              n > 1
                ? "Oturum görsellerinin 3D sergisi. Sürükleyerek veya sol/sağ ok tuşlarıyla döndürün. Home başlangıca döner."
                : "Oturum görselinin 3D sergisi"
            }
          >
            <div
              className="a3d"
              data-single={n === 1 ? "true" : "false"}
              style={{
                ["--n" as string]: n,
                ["--step" as string]: `${stepDeg}deg`,
                ["--start" as string]: `${startDeg}deg`,
                ["--radius" as string]: `${radiusEm}em`,
                transform:
                  n === 1 ? undefined : `rotateY(${rotation}deg)`,
              }}
            >
              {gallery.map((item, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={item.id}
                  src={`data:image/png;base64,${item.data}`}
                  alt={item.label}
                  className="card"
                  style={{ ["--i" as string]: i }}
                  draggable={false}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
