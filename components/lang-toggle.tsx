"use client";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";

export function LangToggle() {
  const [lang, setLang] = useLang();
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Toggle language"
      onClick={() => setLang(lang === "en" ? "hi" : "en")}
      className="text-xs font-medium"
    >
      <Globe className="h-3.5 w-3.5" />
      {lang === "en" ? "EN" : "हिं"}
    </Button>
  );
}
