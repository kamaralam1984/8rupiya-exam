"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Loader2, Bot, User, Volume2, VolumeX, Sparkles, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

type Msg = { role: "user" | "ai"; text: string };

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export function VoiceTutorClient() {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [muted, setMuted] = useState(false);
  const recRef = useRef<any>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = lang === "hi" ? "hi-IN" : "en-IN";
    rec.onresult = (e: any) => {
      let txt = "";
      for (let i = e.resultIndex; i < e.results.length; i++) txt += e.results[i][0].transcript;
      setTranscript(txt);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
  }, [lang]);

  function start() {
    if (!recRef.current) return;
    setTranscript("");
    setListening(true);
    try { recRef.current.start(); } catch { setListening(false); }
  }
  function stop() {
    if (!recRef.current) return;
    try { recRef.current.stop(); } catch {}
  }

  async function send(text: string) {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);
    const r = await api<{ answer: string; steps: string[]; concept?: string }>("/api/ai/doubt", {
      method: "POST",
      body: JSON.stringify({ question: text, language: lang }),
    });
    setLoading(false);
    if (!r.ok) {
      const errMsg = r.error.code === "UNAUTHENTICATED"
        ? "Sign in to use voice tutor."
        : r.error.message ?? "Voice tutor failed";
      setMessages((m) => [...m, { role: "ai", text: errMsg }]);
      return;
    }
    const reply = r.data.answer + (r.data.steps?.length ? "\n\nSteps:\n• " + r.data.steps.join("\n• ") : "");
    setMessages((m) => [...m, { role: "ai", text: reply }]);
    if (!muted) speak(r.data.answer, lang);
  }

  function speak(text: string, l: "en" | "hi") {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = l === "hi" ? "hi-IN" : "en-IN";
    u.rate = 0.95;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
  }

  if (!supported) {
    return (
      <div className="neon-card p-6">
        <p className="text-sm">Your browser doesn't support Web Speech API. Use Chrome/Edge on desktop or mobile, or try our text-based <a className="text-brand-500 underline" href="/doubt">Doubt Solver</a> instead.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="neon-card p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setLang((l) => (l === "en" ? "hi" : "en"))}
            className="ai-chip"
          >
            <Languages className="h-3 w-3 text-cyan-300" /> {lang === "hi" ? "Hindi" : "English"} (tap to switch)
          </button>
          <button
            onClick={() => setMuted((m) => !m)}
            className="ai-chip"
            title="Toggle TTS"
          >
            {muted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3 text-emerald-300" />}
            {muted ? "Muted" : "Audio on"}
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 py-6">
          <motion.button
            onClick={listening ? stop : start}
            animate={{ scale: listening ? [1, 1.08, 1] : 1 }}
            transition={listening ? { repeat: Infinity, duration: 1.2 } : { duration: 0.2 }}
            className={`h-24 w-24 rounded-full flex items-center justify-center text-white shadow-lg ${
              listening ? "bg-gradient-to-br from-rose-500 to-pink-600" : "bg-gradient-to-br from-cyan-500 to-purple-600"
            }`}
          >
            {listening ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
          </motion.button>
          <p className="text-sm text-muted-foreground">
            {listening ? "Listening…" : "Tap mic, ask anything."}
          </p>
          {transcript && (
            <p className="max-w-md text-center text-sm italic text-foreground/80">"{transcript}"</p>
          )}
          {transcript && !listening && (
            <Button onClick={() => { send(transcript); setTranscript(""); }} className="btn-ai">
              <Sparkles className="h-4 w-4" /> Ask AI
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`neon-card p-4 ${m.role === "user" ? "" : "bg-gradient-to-br from-purple-500/10 to-cyan-500/5"}`}>
            <div className="flex items-start gap-3">
              {m.role === "user" ? <User className="h-4 w-4 text-cyan-300 mt-1" /> : <Bot className="h-4 w-4 text-purple-300 mt-1" />}
              <p className="text-sm whitespace-pre-wrap leading-relaxed flex-1">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="neon-card p-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> AI thinking…
          </div>
        )}
      </div>
    </div>
  );
}
