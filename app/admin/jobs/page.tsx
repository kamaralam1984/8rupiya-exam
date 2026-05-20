import type { Metadata } from "next";
import { JobsView } from "./JobsView";
export const metadata: Metadata = { title: "Admin · Jobs", robots: { index: false, follow: false } };
export default function Page() { return <JobsView />; }
