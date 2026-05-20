import type { Metadata } from "next";
import { ExamsAdminView } from "./ExamsAdminView";

export const metadata: Metadata = {
  title: "Admin · Exams",
  robots: { index: false, follow: false },
};

export default function AdminExamsPage() {
  return <ExamsAdminView />;
}
