import type { Metadata } from "next";
import { PdfAdminView } from "./PdfAdminView";

export const metadata: Metadata = {
  title: "Admin · PDFs",
  robots: { index: false, follow: false },
};

export default function AdminPdfsPage() {
  return <PdfAdminView />;
}
