"use client";
import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

export function VoiceButton({ text, lang = "en-IN" }: { text: string; lang?: string }) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  if (!supported) return null;

  function toggle() {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.slice(0, 4500));
    u.lang = lang;
    u.rate = 0.95;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs hover:bg-muted transition"
      aria-label={speaking ? "Stop" : "Listen"}
    >
      {speaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
      {speaking ? "Stop" : "Listen"}
    </button>
  );
}
