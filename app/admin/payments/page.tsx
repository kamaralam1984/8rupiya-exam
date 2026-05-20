import type { Metadata } from "next";
import { PaymentsAdminView } from "./PaymentsAdminView";

export const metadata: Metadata = { title: "Admin · Payments", robots: { index: false, follow: false } };
export default function Page() { return <PaymentsAdminView />; }
