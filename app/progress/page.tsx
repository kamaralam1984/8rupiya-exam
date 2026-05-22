import type { Metadata } from "next";
import { ProgressClient } from "./ProgressClient";

export const metadata: Metadata = {
  title: "My Progress · 8Rupiya",
  description: "Track your daily, weekly and monthly exam preparation progress.",
};

export const dynamic = "force-dynamic";

export default function ProgressPage() {
  return <ProgressClient />;
}
