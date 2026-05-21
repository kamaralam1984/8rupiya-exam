import type { Metadata } from "next";
import { PlansAdminView } from "./PlansAdminView";
import { KNOWN_FEATURES } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "Admin · Plans",
  robots: { index: false, follow: false },
};

export default function AdminPlansPage() {
  // Pass the feature catalog to the client so it can render checkboxes.
  const features = KNOWN_FEATURES.map((f) => ({ key: f.key, label: f.label }));
  return <PlansAdminView allFeatures={features} />;
}
