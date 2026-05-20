import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SITE_DOMAIN = "8rupiya.in";
// Allow override via NEXT_PUBLIC_SITE_URL so dev (localhost:3000) and other
// environments work without changing this file. Defaults to the public domain.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? `https://${SITE_DOMAIN}`;

export const SITE = {
  name: "8Rupia",
  domain: SITE_DOMAIN,
  url: SITE_URL,
  tagline: "AI Powered Exam Preparation for Just ₹8",
  description:
    "8Rupia is an AI-powered Indian exam prep platform offering CTET, SSC, Railway, Banking, CUET, Class 10, NIIT, Police and Teacher mock tests with personalized analytics and AI study plans — premium tests unlock for just ₹8.",
  twitter: "@8rupiya",
  email: "support@8rupiya.in",
};
