import type { Metadata } from "next";
import { WalletView } from "./WalletView";
export const metadata: Metadata = { title: "Wallet", robots: { index: false, follow: false } };
export default function Page() { return <WalletView />; }
