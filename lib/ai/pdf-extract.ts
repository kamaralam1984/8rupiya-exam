import fs from "node:fs/promises";
import pdfParse from "pdf-parse";

export async function extractPdfText(path: string): Promise<{ text: string; pages: number }> {
  const buf = await fs.readFile(path);
  const res = await pdfParse(buf);
  return { text: res.text, pages: res.numpages };
}

export function chunkText(text: string, maxChars = 12000): string[] {
  const paras = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let buf = "";
  for (const p of paras) {
    if ((buf + "\n\n" + p).length > maxChars) {
      if (buf) chunks.push(buf);
      buf = p.length > maxChars ? p.slice(0, maxChars) : p;
    } else {
      buf = buf ? buf + "\n\n" + p : p;
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}
