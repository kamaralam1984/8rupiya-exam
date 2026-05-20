import type { Metadata } from "next";
import { BookmarksView } from "./BookmarksView";

export const metadata: Metadata = {
  title: "Your Bookmarks",
  robots: { index: false, follow: false },
};

export default function BookmarksPage() {
  return <BookmarksView />;
}
