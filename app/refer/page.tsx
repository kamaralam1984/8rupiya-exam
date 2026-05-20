import type { Metadata } from "next";
import { ReferView } from "./ReferView";
export const metadata: Metadata = { title: "Refer & Earn", robots: { index: false, follow: false } };
export default function Page() { return <ReferView />; }
