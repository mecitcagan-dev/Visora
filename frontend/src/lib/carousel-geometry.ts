/**
 * 3D carousel geometry — card CSS size stays fixed (`--w: 17.5em`).
 *
 * Empirically tuned in `/sergi-debug` with numbered placeholders +
 * getBoundingClientRect / screenshots (n=1..10):
 *   n=2: step 32° / r 36em — clear gap, gentle V
 *   n=3: step 30° / r 34em — separated, no book-pinch
 *   n=4: step 22° / r 54em — even fan, centered
 *   n=5: step 18° / r 58em — clear gaps + edge mask
 *   n=6..10: full cylinder, classic chord radius (front trio balanced)
 *   n>10: same continuous cylinder formula
 */

export type CarouselGeometry = {
  stepDeg: number;
  startDeg: number;
  radiusEm: number;
};

/** Must match `.card { --w }` in gallery-3d.css */
export const CARD_W_EM = 17.5;
export const CARD_GAP_EM = 0.5;
export const HALF_CHORD_EM = 0.5 * CARD_W_EM + CARD_GAP_EM;

export function cylinderRadius(stepDeg: number): number {
  return HALF_CHORD_EM / Math.tan(((stepDeg / 2) * Math.PI) / 180);
}

type Tuned = {
  stepDeg: number;
  radiusEm: number;
  mode: "fan" | "cylinder";
};

/** Browser-lab winners for n = 2..10 */
export const GEOMETRY_BY_N: Record<number, Tuned> = {
  2: { stepDeg: 32, radiusEm: 36, mode: "fan" },
  3: { stepDeg: 30, radiusEm: 34, mode: "fan" },
  4: { stepDeg: 22, radiusEm: 54, mode: "fan" },
  5: { stepDeg: 18, radiusEm: 58, mode: "fan" },
  6: { stepDeg: 60, radiusEm: cylinderRadius(60), mode: "cylinder" },
  7: {
    stepDeg: 360 / 7,
    radiusEm: cylinderRadius(360 / 7),
    mode: "cylinder",
  },
  8: { stepDeg: 45, radiusEm: cylinderRadius(45), mode: "cylinder" },
  9: { stepDeg: 40, radiusEm: cylinderRadius(40), mode: "cylinder" },
  10: { stepDeg: 36, radiusEm: cylinderRadius(36), mode: "cylinder" },
};

export function carouselGeometry(n: number): CarouselGeometry {
  if (n <= 1) {
    return { stepDeg: 0, startDeg: 0, radiusEm: 0 };
  }

  const tuned = GEOMETRY_BY_N[n];
  if (tuned) {
    return {
      stepDeg: tuned.stepDeg,
      startDeg:
        tuned.mode === "fan" ? -((n - 1) * tuned.stepDeg) / 2 : 0,
      radiusEm: tuned.radiusEm,
    };
  }

  // n > 10: continuous full cylinder
  const stepDeg = 360 / n;
  return {
    stepDeg,
    startDeg: 0,
    radiusEm: cylinderRadius(stepDeg),
  };
}
