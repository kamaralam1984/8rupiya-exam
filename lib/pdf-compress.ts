import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { randomUUID } from "node:crypto";

/**
 * Ghostscript-based PDF compressor.
 *
 * Strategy — keep reading quality intact:
 *   • Default preset is `/printer` → 300 dpi, decent JPEG quality. This is the
 *     "lossless to the human eye" sweet spot used by most production tools.
 *     Typical savings on scanned / image-heavy NCERT books: 40–80%.
 *   • Text-only PDFs stay roughly the same size — gs still re-emits streams.
 *   • If the compressed file ends up LARGER than the source, we keep the source.
 *   • Override via env `PDF_COMPRESS_PRESET` (screen | ebook | printer | prepress)
 *     and `PDF_COMPRESS_DPI` (72–300).
 *
 * Returns a small report so callers can log how much they saved.
 */

export type PdfCompressResult = {
  /** Path to use going forward — either compressed or, on fall-back, the original. */
  outPath: string;
  originalSize: number;
  compressedSize: number;
  /** True if we actually swapped to a smaller compressed file. */
  compressed: boolean;
  savedBytes: number;
  /** -1 when not compressed; otherwise % saved on the original size. */
  savedPct: number;
  /** Preset that was applied. */
  preset: GsPreset;
  /** Stderr message if gs failed (best-effort). */
  error?: string;
};

export type GsPreset = "screen" | "ebook" | "printer" | "prepress";

// Default = /ebook (150 dpi). Sharper than any phone/tablet screen, no visible
// quality loss for reading, and routinely gives 50–80% size reduction on real
// NCERT-style scanned PDFs. /printer (300 dpi) sometimes *increases* size on
// already-optimised inputs, so it's not safe as a default.
const DEFAULT_PRESET: GsPreset = "ebook";
/** Skip compression altogether for files smaller than this. */
const MIN_BYTES_TO_COMPRESS = 200 * 1024; // 200 KB
/** Hard upper bound on gs runtime to avoid wedging the upload route. */
const GS_TIMEOUT_MS = 90_000;

function pickPreset(): GsPreset {
  const v = (process.env.PDF_COMPRESS_PRESET ?? "").trim().toLowerCase();
  if (v === "screen" || v === "ebook" || v === "printer" || v === "prepress") return v;
  return DEFAULT_PRESET;
}

function pickDpi(): number | null {
  const n = parseInt(process.env.PDF_COMPRESS_DPI ?? "", 10);
  if (Number.isFinite(n) && n >= 72 && n <= 600) return n;
  return null;
}

/**
 * Compress a PDF file in place (writes to a sibling tmp, then swaps).
 * Safe to call on any PDF — falls back to original if compression doesn't help.
 */
export async function compressPdf(srcPath: string): Promise<PdfCompressResult> {
  const preset = pickPreset();
  const dpi = pickDpi();

  const originalStat = await fs.stat(srcPath);
  const originalSize = originalStat.size;

  // Skip tiny files — gs overhead outweighs the win.
  if (originalSize < MIN_BYTES_TO_COMPRESS) {
    return {
      outPath: srcPath,
      originalSize,
      compressedSize: originalSize,
      compressed: false,
      savedBytes: 0,
      savedPct: -1,
      preset,
    };
  }

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "pdfcomp-"));
  const tmpOut = path.join(tmpDir, `${randomUUID()}.pdf`);

  // Build gs argv. The downsample params only kick in when /screen | /ebook
  // are paired with a manual DPI override; for /printer the preset already
  // sets sensible image-handling defaults so we just rely on it.
  const args: string[] = [
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.5",
    `-dPDFSETTINGS=/${preset}`,
    "-dNOPAUSE",
    "-dQUIET",
    "-dBATCH",
    "-dSAFER",
    "-dPrinted=false",
    "-dDetectDuplicateImages=true",
    "-dCompressFonts=true",
    "-dSubsetFonts=true",
  ];
  if (dpi) {
    args.push(
      `-dColorImageResolution=${dpi}`,
      `-dGrayImageResolution=${dpi}`,
      `-dMonoImageResolution=${Math.max(dpi, 300)}`,
      "-dDownsampleColorImages=true",
      "-dDownsampleGrayImages=true",
    );
  }
  args.push(`-sOutputFile=${tmpOut}`, srcPath);

  const reportError = await runGhostscript(args).catch((e: Error) => e.message);
  if (typeof reportError === "string") {
    // gs failed — keep original
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    return {
      outPath: srcPath,
      originalSize,
      compressedSize: originalSize,
      compressed: false,
      savedBytes: 0,
      savedPct: -1,
      preset,
      error: reportError,
    };
  }

  let compressedSize = originalSize;
  try {
    compressedSize = (await fs.stat(tmpOut)).size;
  } catch {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    return {
      outPath: srcPath,
      originalSize,
      compressedSize: originalSize,
      compressed: false,
      savedBytes: 0,
      savedPct: -1,
      preset,
      error: "gs produced no output",
    };
  }

  // If compression didn't help (PDFs already optimised), keep the original.
  if (compressedSize >= originalSize) {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    return {
      outPath: srcPath,
      originalSize,
      compressedSize,
      compressed: false,
      savedBytes: 0,
      savedPct: 0,
      preset,
    };
  }

  // Swap: move tmp over the original.
  await fs.copyFile(tmpOut, srcPath);
  await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});

  const savedBytes = originalSize - compressedSize;
  return {
    outPath: srcPath,
    originalSize,
    compressedSize,
    compressed: true,
    savedBytes,
    savedPct: Math.round((savedBytes / originalSize) * 1000) / 10,
    preset,
  };
}

function runGhostscript(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("gs", args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (d) => {
      stderr += d.toString();
      if (stderr.length > 8192) stderr = stderr.slice(-8192);
    });

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("ghostscript timed out"));
    }, GS_TIMEOUT_MS);

    child.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`gs exit ${code}: ${stderr.trim().split("\n").slice(-3).join(" | ")}`));
    });
  });
}
