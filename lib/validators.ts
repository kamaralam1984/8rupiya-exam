import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2).max(80).optional(),
    email: z.string().email().optional(),
    phone: z.string().regex(/^\+?\d{10,14}$/).optional(),
    password: z.string().min(8).max(120),
    language: z.enum(["en", "hi"]).default("en"),
    ref: z.string().max(20).optional(),
  })
  .refine((d) => d.email || d.phone, { message: "Provide email or phone" });

/** Full student signup payload — used by /api/auth/signup/start (email OTP gated). */
export const signupStartSchema = z.object({
  name: z.string().min(2, "Name min 2 chars").max(80),
  email: z.string().email("Valid email required"),
  phone: z.string().regex(/^\+?\d{10,14}$/, "10-14 digit phone, +91 optional"),
  age: z.number().int().min(8, "Min age 8").max(100, "Max age 100"),
  examSlug: z.string().min(1, "Exam selection required"),
  password: z.string().min(8, "Password min 8 chars").max(120),
  language: z.enum(["en", "hi"]).default("en"),
  ref: z.string().max(20).optional(),
});
export type SignupStartInput = z.infer<typeof signupStartSchema>;

export const signupVerifySchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/, "6-digit code expected"),
});

export const loginSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().regex(/^\+?\d{10,14}$/).optional(),
    password: z.string().min(1),
  })
  .refine((d) => d.email || d.phone, { message: "Provide email or phone" });

export const startAttemptSchema = z.object({
  testSetSlug: z.string().min(1),
});

export const submitAttemptSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedIndex: z.number().int().min(-1).max(20),
      timeSpentMs: z.number().int().min(0).optional(),
      flagged: z.boolean().optional(),
      guessed: z.boolean().optional(),
    })
  ),
  violations: z
    .array(z.object({ kind: z.string().max(40), at: z.number() }))
    .max(500)
    .optional(),
});

export const createOrderSchema = z.object({
  testSetSlug: z.string().min(1),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1),
});

export const doubtSchema = z.object({
  question: z.string().min(3).max(2000),
  language: z.enum(["en", "hi"]).default("en"),
  imageUrl: z.string().url().optional(),
  imageDataUrl: z.string().regex(/^data:image\/(png|jpeg|jpg|webp);base64,/).max(7_000_000).optional(),
  imageDataUrls: z
    .array(z.string().regex(/^data:image\/(png|jpeg|jpg|webp);base64,/).max(7_000_000))
    .max(4)
    .optional(),
  examSlug: z.string().optional(),
  subjectSlug: z.string().optional(),
});

export const weaknessSchema = z.object({
  attemptId: z.string(),
  language: z.enum(["en", "hi"]).default("en"),
});

export const predictSchema = z.object({
  examSlug: z.string(),
  subjectSlug: z.string().optional(),
  count: z.number().int().min(5).max(50).default(20),
});

export const adminUploadPdfSchema = z.object({
  examSlug: z.string().optional(),
  filename: z.string().min(1),
  storagePath: z.string().min(1),
  pageCount: z.number().int().optional(),
});

export const pdfIngestConfigSchema = z
  .object({
    mode: z.enum(["book", "questions", "pyq"]).default("book"),
    examSlug: z.string().optional(),
    subjectSlug: z.string().optional(),
    /** Year of the PYQ paper (only meaningful when mode==="pyq"). */
    year: z.number().int().min(1990).max(2100).optional(),
    durationMin: z.number().int().min(5).max(360).default(60),
    totalQuestions: z.number().int().min(5).max(500).default(50),
    easyPct: z.number().int().min(0).max(100).default(30),
    mediumPct: z.number().int().min(0).max(100).default(50),
    hardPct: z.number().int().min(0).max(100).default(20),
    language: z.enum(["en", "hi"]).default("en"),
    title: z.string().min(3).max(120).optional(),
    autoCreateTestSet: z.boolean().default(true),
    isPremium: z.boolean().default(false),
  })
  .refine((c) => c.mode !== "book" || c.easyPct + c.mediumPct + c.hardPct === 100, {
    message: "In book mode easyPct + mediumPct + hardPct must equal 100",
  })
  .refine((c) => c.mode !== "pyq" || (typeof c.year === "number" && c.examSlug), {
    message: "PYQ mode needs both year and examSlug",
  });

export type PdfIngestConfig = z.infer<typeof pdfIngestConfigSchema>;
