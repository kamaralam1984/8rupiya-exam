import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "8Rupia — AI Powered Exam Preparation for Just ₹8";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, #0a0f1e 0%, #1f48b8 60%, #a855f7 100%)",
          fontFamily: "system-ui",
          color: "white",
          position: "relative",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -2, display: "flex", alignItems: "center", gap: 16 }}>
          ✨ 8Rupia
        </div>
        <div style={{ fontSize: 48, fontWeight: 700, marginTop: 24, textAlign: "center", padding: "0 80px" }}>
          AI Powered Exam Preparation
        </div>
        <div style={{ fontSize: 80, fontWeight: 900, marginTop: 16, background: "linear-gradient(90deg,#7aa2ff,#a855f7)", backgroundClip: "text", color: "transparent" }}>
          for Just ₹8
        </div>
        <div style={{ fontSize: 28, marginTop: 32, opacity: 0.7 }}>
          CTET · SSC · Railway · Banking · CUET · Class 10
        </div>
        <div style={{ position: "absolute", bottom: 32, fontSize: 22, opacity: 0.5 }}>
          8rupiya.in
        </div>
      </div>
    ),
    size,
  );
}
