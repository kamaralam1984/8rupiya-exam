import type { Metadata } from "next";
import { QuestionAdminView } from "./QuestionAdminView";

export const metadata: Metadata = {
  title: "Admin · Questions",
  robots: { index: false, follow: false },
};

export default function AdminQuestionsPage() {
  return <QuestionAdminView />;
}
