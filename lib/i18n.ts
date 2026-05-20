"use client";
import { useEffect, useState, useSyncExternalStore } from "react";

export type Lang = "en" | "hi";

const DICT: Record<Lang, Record<string, string>> = {
  en: {
    "hero.tagline": "AI Powered Exam Preparation for Just ₹8",
    "hero.sub": "Premium mock tests, AI prediction sets, personalized weakness analysis and smart study plans — all unlocked for the price of a chai.",
    "cta.startFree": "Start Free Test",
    "cta.aiPredict": "AI Prediction Test",
    "cta.analyzeWeak": "Analyze My Weakness",
    "nav.exams": "Exams",
    "nav.pricing": "Pricing",
    "nav.blog": "Blog",
    "nav.about": "About",
    "dashboard.title": "Your Dashboard",
    "dashboard.attempts": "Recent Attempts",
    "doubt.title": "AI Doubt Solver",
    "doubt.placeholder": "Ask any academic question — math, science, polity, English, anything…",
    "planner.title": "AI Study Planner",
    "leaderboard.title": "Leaderboard",
    "common.loading": "Loading…",
    "common.submit": "Submit",
    "common.cancel": "Cancel",
    "q.counter": "Question {n} of {total}",
    "q.markReview": "Mark for review",
    "q.marked": "Marked",
    "q.clear": "Clear response",
    "q.translating": "Translating…",
    "q.translateFailed": "Translation failed",
    "q.translatedTo": "Translated to {lang}",
  },
  hi: {
    "hero.tagline": "सिर्फ ₹8 में AI Powered Exam तैयारी",
    "hero.sub": "Premium mock tests, AI prediction sets, personalized weakness analysis aur smart study plans — sab ek chai ke daam mein unlock.",
    "cta.startFree": "Free Test शुरू करें",
    "cta.aiPredict": "AI Prediction टेस्ट",
    "cta.analyzeWeak": "मेरी कमज़ोरी जांचें",
    "nav.exams": "एग्ज़ाम्स",
    "nav.pricing": "Pricing",
    "nav.blog": "Blog",
    "nav.about": "About",
    "dashboard.title": "आपका डैशबोर्ड",
    "dashboard.attempts": "हाल के Attempts",
    "doubt.title": "AI डाउट सॉल्वर",
    "doubt.placeholder": "कोई भी सवाल पूछें — गणित, विज्ञान, polity, English, कुछ भी…",
    "planner.title": "AI स्टडी प्लानर",
    "leaderboard.title": "लीडरबोर्ड",
    "common.loading": "लोड हो रहा है…",
    "common.submit": "सबमिट",
    "common.cancel": "रद्द करें",
    "q.counter": "प्रश्न {n} / {total}",
    "q.markReview": "समीक्षा के लिए मार्क करें",
    "q.marked": "मार्क किया",
    "q.clear": "उत्तर हटाएँ",
    "q.translating": "अनुवाद हो रहा है…",
    "q.translateFailed": "अनुवाद विफल",
    "q.translatedTo": "{lang} में अनुवादित",
  },
};

const COOKIE_NAME = "8r_lang";
const EVENT = "8r:lang-change";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
}

let currentLang: Lang = "en";
let initialized = false;

function getSnapshot(): Lang {
  return currentLang;
}

function getServerSnapshot(): Lang {
  return "en";
}

function subscribe(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

function ensureInit() {
  if (initialized || typeof window === "undefined") return;
  const c = readCookie(COOKIE_NAME) as Lang | null;
  if (c === "en" || c === "hi") currentLang = c;
  initialized = true;
}

export function useLang(): [Lang, (l: Lang) => void] {
  // initialize from cookie before first paint on client
  if (typeof window !== "undefined") ensureInit();
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setLang = (l: Lang) => {
    document.cookie = `${COOKIE_NAME}=${l}; path=/; max-age=${60 * 60 * 24 * 365}`;
    currentLang = l;
    window.dispatchEvent(new Event(EVENT));
  };
  return [lang, setLang];
}

export function useT() {
  const [lang] = useLang();
  return (key: string, vars?: Record<string, string | number>) => {
    const raw = DICT[lang][key] ?? DICT.en[key] ?? key;
    if (!vars) return raw;
    return raw.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
  };
}
