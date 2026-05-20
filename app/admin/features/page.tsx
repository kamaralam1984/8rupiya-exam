import type { Metadata } from "next";
import { FeaturesView } from "./FeaturesView";

export const metadata: Metadata = {
  title: "Admin · Features",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <FeaturesView />;
}
