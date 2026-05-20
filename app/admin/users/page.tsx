import type { Metadata } from "next";
import { UsersAdminView } from "./UsersAdminView";

export const metadata: Metadata = { title: "Admin · Users", robots: { index: false, follow: false } };
export default function Page() { return <UsersAdminView />; }
