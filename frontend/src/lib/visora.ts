export type StyleId = "minimal" | "photorealism" | "illustration";
export type RatioId = "landscape" | "square";

export type GeneratedImage = {
  data: string;
  filename: string;
  prompt: string;
  label: string;
};

export type GenerateResponse = {
  images: GeneratedImage[];
  enrichment_source: "groq" | "pollinations" | "template";
};

export type GalleryItem = GeneratedImage & {
  id: string;
  source: GenerateResponse["enrichment_source"];
};

export const STYLES: { id: StyleId; title: string; blurb: string }[] = [
  {
    id: "minimal",
    title: "Minimal",
    blurb: "Temiz vektör, bol boşluk",
  },
  {
    id: "photorealism",
    title: "Fotoğraf",
    blurb: "Gerçekçi ışık ve doku",
  },
  {
    id: "illustration",
    title: "İllüstrasyon",
    blurb: "Boyanmış blog sanatı",
  },
];

export const RATIOS: { id: RatioId; title: string; blurb: string }[] = [
  { id: "landscape", title: "Yatay kapak", blurb: "1344×768" },
  { id: "square", title: "Kare", blurb: "1024×1024" },
];

export function apiBase(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "http://127.0.0.1:8000"
  );
}

export function downloadImage(img: Pick<GeneratedImage, "data" | "filename">) {
  const link = document.createElement("a");
  link.href = `data:image/png;base64,${img.data}`;
  link.download = img.filename;
  link.click();
}
