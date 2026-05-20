import Image from "next/image";

/**
 * Hero illustration — actual photo of a student holding books/notebook.
 * Decorations (scribbles, dots) are already baked into the image so we just
 * frame it inside a soft circular indigo backdrop to match the EduLearn look.
 */
export function StudentIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Soft circular backdrop behind the photo */}
      <div className="absolute inset-0 m-auto h-[92%] w-[92%] rounded-full bg-gradient-to-br from-brand-500/15 via-brand-400/10 to-accent/10" />

      {/* Faint dot accents at the corners */}
      <div
        className="absolute -top-2 left-2 h-16 w-16 opacity-60 z-0"
        style={{
          backgroundImage: "radial-gradient(hsl(var(--primary) / 0.45) 1px, transparent 1px)",
          backgroundSize: "10px 10px",
        }}
      />
      <div
        className="absolute bottom-2 right-2 h-16 w-16 opacity-60 z-0"
        style={{
          backgroundImage: "radial-gradient(hsl(var(--accent) / 0.55) 1px, transparent 1px)",
          backgroundSize: "10px 10px",
        }}
      />

      {/* The student photo — sits above the backdrop, no fixed aspect so it scales naturally */}
      <Image
        src="/hero-student.png"
        alt="Smiling student holding a notebook and books"
        width={1536}
        height={1024}
        priority
        className="relative w-full h-auto rounded-3xl drop-shadow-2xl"
      />
    </div>
  );
}
