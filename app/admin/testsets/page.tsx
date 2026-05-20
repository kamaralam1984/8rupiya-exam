import type { Metadata } from "next";
import { TestSetsAdminView } from "./TestSetsAdminView";

export const metadata: Metadata = {
  title: "Admin · Test Sets",
  robots: { index: false, follow: false },
};

export default function AdminTestSetsPage() {
  return <TestSetsAdminView />;
}
