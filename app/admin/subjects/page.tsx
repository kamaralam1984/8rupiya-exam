import type { Metadata } from "next";
import { SubjectsAdminView } from "./SubjectsAdminView";

export const metadata: Metadata = {
  title: "Admin · Subjects",
  robots: { index: false, follow: false },
};

export default function AdminSubjectsPage() {
  return <SubjectsAdminView />;
}
