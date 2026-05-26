"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Link2,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  Plug,
} from "lucide-react";
import { connectWebsite, type ConnectState } from "@/lib/connect-website";

interface ConnectBackendProps {
  open: boolean;
  onClose: () => void;
  onConnected?: (url: string) => void;
}

export function ConnectBackend({ open, onClose, onConnected }: ConnectBackendProps) {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [secretToken, setSecretToken] = useState("");
  const [state, setState] = useState<ConnectState>("idle");
  const [message, setMessage] = useState("");

  const isConnecting = state === "connecting";
  const isSuccess = state === "success";
  const canSubmit = !isConnecting && !!websiteUrl && !!apiKey && !!secretToken;

  async function handleConnect() {
    if (!canSubmit) return;
    setState("connecting");
    setMessage("");

    const result = await connectWebsite({ websiteUrl, apiKey, secretToken });

    if (result.ok) {
      setState("success");
      setMessage("Connected Successfully");
      onConnected?.(websiteUrl);
    } else {
      setState("error");
      const code = result.error.code;
      if (code === "INVALID_API_KEY") {
        setMessage("Invalid API Key or Secret Token");
      } else if (code === "CONNECTION_FAILED") {
        setMessage("Connection Failed — could not reach the backend");
      } else {
        setMessage(result.error.message ?? "Connection Failed");
      }
    }
  }

  function handleClose() {
    if (isConnecting) return;
    onClose();
    setTimeout(() => {
      setState("idle");
      setMessage("");
    }, 300);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal card */}
          <motion.div
            className="relative w-full max-w-md"
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
          >
            {/* Glow halo */}
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-violet-500/20 via-transparent to-indigo-500/20 blur-xl" />

            {/* Glass card */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">
              {/* Top gradient line */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />

              <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 ring-1 ring-violet-500/30">
                      <Plug className="h-5 w-5 text-violet-400" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-white">Connect Backend</h2>
                      <p className="mt-0.5 text-xs text-white/40">
                        Link your admin panel securely via API credentials
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={isConnecting}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white/80 disabled:pointer-events-none"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Fields */}
                <div className="space-y-3.5">
                  <FormField
                    label="Website URL"
                    icon={<Link2 className="h-3 w-3" />}
                    placeholder="https://admin.yourbackend.com"
                    value={websiteUrl}
                    onChange={setWebsiteUrl}
                    type="url"
                    disabled={isConnecting || isSuccess}
                  />
                  <FormField
                    label="API Key"
                    icon={<KeyRound className="h-3 w-3" />}
                    placeholder="ak_live_••••••••••••••••"
                    value={apiKey}
                    onChange={setApiKey}
                    type="password"
                    disabled={isConnecting || isSuccess}
                  />
                  <FormField
                    label="Secret Token"
                    icon={<ShieldCheck className="h-3 w-3" />}
                    placeholder="sk_••••••••••••••••••••••"
                    value={secretToken}
                    onChange={setSecretToken}
                    type="password"
                    disabled={isConnecting || isSuccess}
                  />
                </div>

                {/* Status banner */}
                <AnimatePresence mode="wait">
                  {state !== "idle" && (
                    <motion.div
                      key={state}
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <StatusBanner state={state} message={message} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Connect button */}
                <motion.button
                  onClick={handleConnect}
                  disabled={!canSubmit}
                  className="relative mt-5 w-full overflow-hidden rounded-xl py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                  whileTap={canSubmit ? { scale: 0.98 } : undefined}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600" />
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    {isConnecting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isSuccess && <CheckCircle2 className="h-4 w-4" />}
                    {isConnecting
                      ? "Connecting..."
                      : isSuccess
                        ? "Connected"
                        : "Connect Now"}
                  </span>
                </motion.button>

                {/* Footer hint */}
                <p className="mt-4 text-center text-xs text-white/25">
                  Credentials are sent over HTTPS and never stored in the browser.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Sub-components ────────────────────────────────────────────

function FormField({
  label,
  icon,
  placeholder,
  value,
  onChange,
  type,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  disabled: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-white/50">
        {icon}
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoComplete="off"
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none ring-0 transition-all focus:border-violet-500/50 focus:bg-white/10 focus:ring-1 focus:ring-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}

function StatusBanner({ state, message }: { state: ConnectState; message: string }) {
  if (state === "connecting") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs text-blue-300">
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
        <span>Connecting to backend…</span>
      </div>
    );
  }
  if (state === "success") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        <span>{message}</span>
      </div>
    );
  }
  if (state === "error") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
        <XCircle className="h-3.5 w-3.5 shrink-0" />
        <span>{message}</span>
      </div>
    );
  }
  return null;
}
