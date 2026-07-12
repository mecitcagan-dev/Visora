import { ImageResponse } from "next/og";

export const alt = "Visora — AI ile blog görselleri";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Static brand OG image (1200×630). No third-party / Wikimedia art. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #F3F5F7 0%, #EEF2F5 45%, #CCFBF1 100%)",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 480,
            height: 480,
            borderRadius: 9999,
            background: "rgba(15, 118, 110, 0.08)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            padding: 48,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#12161C",
              lineHeight: 1.05,
            }}
          >
            Visora
          </div>
          <div
            style={{
              fontSize: 32,
              fontFamily: "system-ui, sans-serif",
              fontWeight: 500,
              color: "#5C6675",
              textAlign: "center",
              maxWidth: 720,
              lineHeight: 1.35,
            }}
          >
            AI ile stil ve ışıkla zenginleştirilmiş blog görselleri
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 22,
              fontFamily: "system-ui, sans-serif",
              color: "#0F766E",
              fontWeight: 600,
            }}
          >
            Ücretsiz · Tarayıcıda üret · Tıkla indir
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
