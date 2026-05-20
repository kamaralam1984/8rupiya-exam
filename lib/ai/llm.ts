import OpenAI from "openai";

declare global {
  // eslint-disable-next-line no-var
  var __openai_clients: Map<Provider, OpenAI> | undefined;
}

type Provider =
  | "openai"
  | "openrouter"
  | "groq"
  | "deepseek"
  | "together"
  | "mistral"
  | "huggingface";

export type AiOperation =
  | "ingest"      // PDF → MCQ generation (bulk, free providers fine)
  | "translate"   // MCQ translation (bulk, free providers fine)
  | "doubt"       // Student doubt solver
  | "plan"        // Study plan
  | "predict"     // High-stakes predicted set
  | "pyq"         // Previous-year analysis (2026 prediction)
  | "default";

const PROVIDERS: Record<
  Provider,
  { baseURL?: string; envKey: string; defaultModel: string; fastModel: string }
> = {
  // Paid (last resort)
  openai:      { envKey: "OPENAI_API_KEY",      defaultModel: "gpt-4o-mini",                  fastModel: "gpt-4o-mini" },
  // Free / generous-free providers
  groq:        { envKey: "GROQ_API_KEY",        baseURL: "https://api.groq.com/openai/v1",
                 defaultModel: "llama-3.3-70b-versatile", fastModel: "llama-3.1-8b-instant" },
  openrouter:  { envKey: "OPENROUTER_API_KEY",  baseURL: "https://openrouter.ai/api/v1",
                 defaultModel: "meta-llama/llama-3.3-70b-instruct:free",
                 fastModel: "google/gemini-2.0-flash-exp:free" },
  together:    { envKey: "TOGETHER_API_KEY",    baseURL: "https://api.together.xyz/v1",
                 defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
                 fastModel: "meta-llama/Llama-3.2-3B-Instruct-Turbo" },
  mistral:     { envKey: "MISTRAL_API_KEY",     baseURL: "https://api.mistral.ai/v1",
                 defaultModel: "mistral-small-latest", fastModel: "mistral-small-latest" },
  deepseek:    { envKey: "DEEPSEEK_API_KEY",    baseURL: "https://api.deepseek.com/v1",
                 defaultModel: "deepseek-chat", fastModel: "deepseek-chat" },
  huggingface: { envKey: "HUGGINGFACE_API_KEY", baseURL: "https://router.huggingface.co/v1",
                 defaultModel: "meta-llama/Llama-3.3-70B-Instruct:novita",
                 fastModel: "meta-llama/Llama-3.2-3B-Instruct:hf-inference" },
};

function isProvider(v: unknown): v is Provider {
  return typeof v === "string" && v in PROVIDERS;
}

function hasKey(p: Provider): boolean {
  return !!process.env[PROVIDERS[p].envKey];
}

/**
 * Defaults if no LLM_CHAIN_<OP> env var is set.
 * Order = "free first, paid last".
 */
const DEFAULT_CHAINS: Record<AiOperation, Provider[]> = {
  ingest:    ["groq", "openrouter", "together", "mistral", "deepseek", "openai"],
  translate: ["groq", "openrouter", "together", "mistral", "deepseek", "openai"],
  doubt:    ["groq", "openrouter", "together", "mistral", "openai"],
  plan:     ["groq", "openrouter", "together", "mistral", "openai"],
  predict:  ["openai", "deepseek", "groq", "openrouter"], // paid first for quality, free fallback
  pyq:      ["openai", "deepseek", "groq", "openrouter"],
  default:  ["groq", "openrouter", "together", "mistral", "deepseek", "openai"],
};

/**
 * Resolve a fallback chain for the operation. Filters out providers without
 * an API key configured.
 */
function pickChain(op?: AiOperation): Provider[] {
  const operation: AiOperation = op ?? "default";
  // 1. Explicit chain env: LLM_CHAIN_INGEST="groq,openrouter,openai"
  const envChain = process.env[`LLM_CHAIN_${operation.toUpperCase()}`];
  if (envChain) {
    const parsed = envChain
      .split(",")
      .map((s) => s.trim())
      .filter(isProvider) as Provider[];
    if (parsed.length) return parsed.filter(hasKey);
  }
  // 2. Single-provider override: LLM_PROVIDER_INGEST=groq
  if (operation !== "default") {
    const single = process.env[`LLM_PROVIDER_${operation.toUpperCase()}`];
    if (isProvider(single) && hasKey(single)) return [single];
  }
  // 3. Global override: LLM_PROVIDER=openai
  const global = process.env.LLM_PROVIDER;
  if (isProvider(global) && hasKey(global)) return [global];
  // 4. Operation default chain (filtered by configured keys)
  return DEFAULT_CHAINS[operation].filter(hasKey);
}

function clientFor(provider: Provider): OpenAI {
  const cache = (global.__openai_clients ??= new Map());
  const hit = cache.get(provider);
  if (hit) return hit;
  const cfg = PROVIDERS[provider];
  const inst = new OpenAI({
    apiKey: process.env[cfg.envKey],
    baseURL: cfg.baseURL,
  });
  cache.set(provider, inst);
  return inst;
}

export function modelsFor(provider: Provider) {
  const cfg = PROVIDERS[provider];
  return {
    primary: cfg.defaultModel,
    fast: cfg.fastModel,
    quality: cfg.defaultModel,
  };
}

// Backward-compat default exports
function pickFirstAvailable(): Provider {
  for (const p of DEFAULT_CHAINS.default) if (hasKey(p)) return p;
  return "openai";
}
const DEFAULT_PROVIDER: Provider = pickFirstAvailable();
export const openai = clientFor(DEFAULT_PROVIDER);
export const MODELS = modelsFor(DEFAULT_PROVIDER);
export const ACTIVE_PROVIDER = DEFAULT_PROVIDER;

export function chainInfoFor(op?: AiOperation) {
  const chain = pickChain(op);
  return chain.map((p) => ({ provider: p, models: modelsFor(p) }));
}

/** Errors that should trigger immediate fallback to the next provider. */
function shouldFallback(e: any): boolean {
  const status = e?.status ?? e?.response?.status;
  if (status === 401 || status === 403) return true; // bad / missing key
  if (status === 404) return true; // model gone on that provider
  if (status === 503 || status === 502 || status === 504) return true; // upstream down
  if (status === 429) return true; // rate-limited
  // Network-level errors don't have status
  if (!status) return true;
  return false;
}

export async function completeJson<T = unknown>(args: {
  system: string;
  user: string;
  imageDataUrl?: string;
  imageDataUrls?: string[];
  maxTokens?: number;
  /** Explicit model name (only honoured if a single provider is resolved). */
  model?: string;
  prefer?: "primary" | "fast" | "quality";
  temperature?: number;
  operation?: AiOperation;
}): Promise<T> {
  const chain = pickChain(args.operation);
  if (chain.length === 0) {
    throw new Error(
      "No LLM provider configured. Set at least one API key (GROQ_API_KEY, OPENAI_API_KEY, …) in .env.local.",
    );
  }

  const allImages = [
    ...(args.imageDataUrls ?? []),
    ...(args.imageDataUrl ? [args.imageDataUrl] : []),
  ];
  const hasImage = allImages.length > 0;
  const userContent: any = hasImage
    ? [
        { type: "text", text: args.user },
        ...allImages.map((url) => ({ type: "image_url", image_url: { url } })),
      ]
    : args.user;

  let lastErr: any;
  for (let i = 0; i < chain.length; i++) {
    const provider = chain[i];
    // Some providers (Groq, Mistral, Together free, DeepSeek text) don't do vision.
    // For image requests, skip non-vision providers and let chain advance.
    if (hasImage && (provider === "groq" || provider === "mistral" || provider === "deepseek" || provider === "together")) {
      continue;
    }
    const client = clientFor(provider);
    const m = modelsFor(provider);
    const tierModel = args.prefer ? m[args.prefer] : m.primary;
    const model = args.model ?? tierModel;

    // Per-provider retry on 429 with provider-suggested backoff (1 retry)
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await client.chat.completions.create({
          model,
          max_tokens: args.maxTokens ?? 4096,
          temperature: args.temperature ?? 0.3,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: args.system },
            { role: "user", content: userContent },
          ],
        });
        const text = res.choices[0]?.message?.content ?? "";
        return parseJson<T>(text);
      } catch (e: any) {
        lastErr = e;
        const status = e?.status ?? e?.response?.status;
        if (status === 429 && attempt === 0) {
          const msg: string = e?.message ?? "";
          const wm = msg.match(/try again in ([\d.]+)s/i);
          const wait = wm ? Math.min(Math.ceil(parseFloat(wm[1]) * 1000) + 500, 8000) : 3000;
          // Only wait+retry once on the same provider; otherwise fall through to next.
          await new Promise((r) => setTimeout(r, wait));
          continue;
        }
        if (shouldFallback(e)) {
          // eslint-disable-next-line no-console
          console.warn(`[llm] ${provider} failed (status=${status ?? "n/a"}): ${String(e?.message ?? "").slice(0, 200)} — falling back to next provider`);
          break; // exit retry loop, advance to next provider in chain
        }
        // Hard error (e.g. invalid JSON spec from caller, schema-validation): rethrow.
        throw e;
      }
    }
  }
  throw lastErr ?? new Error("All providers in the chain failed");
}

function parseJson<T>(text: string): T {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : trimmed;
  try {
    return JSON.parse(candidate) as T;
  } catch {
    const m = candidate.match(/[\[{][\s\S]*[\]}]/);
    if (!m) throw new Error("AI returned non-JSON: " + candidate.slice(0, 200));
    return JSON.parse(m[0]) as T;
  }
}
