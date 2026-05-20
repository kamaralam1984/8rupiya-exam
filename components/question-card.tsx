"use client";
import { useEffect, useState } from "react";
import { Flag, Loader2, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT, useLang } from "@/lib/i18n";
import { api } from "@/lib/api-client";
import { getCached, setCached } from "@/lib/translate-cache";

export type Question = {
  id: string;
  stem: string;
  options: string[];
  order: number;
  marksRight: number;
  marksWrong: number;
  language?: string;
};

export function QuestionCard({
  q, index, total, selected, flagged, onSelect, onToggleFlag, onClear,
}: {
  q: Question;
  index: number;
  total: number;
  selected: number | null;
  flagged: boolean;
  onSelect: (i: number) => void;
  onToggleFlag: () => void;
  onClear: () => void;
}) {
  const t = useT();
  const [lang] = useLang();
  const sourceLang = (q.language ?? "en") as string;
  const needsTranslation = lang !== sourceLang;

  const [translation, setTranslation] = useState(() =>
    needsTranslation ? getCached(q.id, lang) : null
  );
  const [translating, setTranslating] = useState(false);
  const [xlateError, setXlateError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setXlateError(null);

    if (!needsTranslation) {
      setTranslation(null);
      setTranslating(false);
      return;
    }

    const cached = getCached(q.id, lang);
    if (cached) {
      setTranslation(cached);
      setTranslating(false);
      return;
    }

    setTranslating(true);
    (async () => {
      const r = await api<{ stem: string; options: string[] }>("/api/i18n/translate", {
        method: "POST",
        body: JSON.stringify({ questionId: q.id, targetLang: lang }),
      });
      if (!active) return;
      setTranslating(false);
      if (!r.ok) {
        setXlateError(r.error.message ?? r.error.code);
        return;
      }
      const tr = { stem: r.data.stem, options: r.data.options };
      setCached(q.id, lang, tr);
      setTranslation(tr);
    })();
    return () => {
      active = false;
    };
  }, [q.id, lang, needsTranslation]);

  const displayStem = needsTranslation && translation ? translation.stem : q.stem;
  const displayOptions =
    needsTranslation && translation ? translation.options : q.options;

  return (
    <div className="glass rounded-2xl p-6 md:p-8 gradient-border">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{t("q.counter", { n: index + 1, total })}</span>
        <div className="flex items-center gap-3">
          <span>+{q.marksRight} · {q.marksWrong}</span>
          <button
            onClick={onToggleFlag}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition",
              flagged
                ? "bg-violet-500/20 text-violet-600 dark:text-violet-300"
                : "hover:bg-muted"
            )}
            aria-pressed={flagged}
          >
            <Flag className="h-3.5 w-3.5" />
            {flagged ? t("q.marked") : t("q.markReview")}
          </button>
        </div>
      </div>

      {needsTranslation && (
        <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Languages className="h-3 w-3" />
          {translating ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" /> {t("q.translating")}
            </>
          ) : xlateError ? (
            <span className="text-red-500">{t("q.translateFailed")}: {xlateError}</span>
          ) : translation ? (
            <span>{t("q.translatedTo", { lang: lang === "hi" ? "हिंदी" : "English" })}</span>
          ) : null}
        </div>
      )}

      <p className="mt-4 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
        {displayStem}
      </p>
      <div className="mt-6 grid gap-2">
        {displayOptions.map((opt, i) => {
          const isSel = selected === i;
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={cn(
                "group flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition",
                "border-border hover:border-brand-500/50 hover:bg-muted/40",
                isSel && "border-brand-500 bg-brand-500/10"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-medium",
                  isSel
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-border text-muted-foreground group-hover:border-brand-500/50"
                )}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-sm md:text-base leading-relaxed">{opt}</span>
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <button
          onClick={onClear}
          className="mt-4 text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
        >
          {t("q.clear")}
        </button>
      )}
    </div>
  );
}
