import { redirect } from "next/navigation";

/** Eski /gallery yolu — Sergiye yönlendirir */
export default function GalleryRedirectPage() {
  redirect("/sergi");
}
