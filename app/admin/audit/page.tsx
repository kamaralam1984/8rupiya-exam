import type { Metadata } from "next";
import { AuditView } from "./AuditView";
export const metadata: Metadata = { title: "Admin · Audit", robots: { index: false, follow: false } };
export default function Page() { return <AuditView />; }
