"use client";
import { useState } from "react";

export function BackendCard() {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        maxWidth: "36rem",
        margin: "0 auto",
        padding: "0 1rem 5rem",
      }}
    >
      <div
        style={{
          background: "#f3e8ff",
          border: "2px solid #7c3aed",
          borderRadius: "1rem",
          padding: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div>
          <h2 style={{ fontWeight: 700, color: "#5b21b6", marginBottom: "4px" }}>
            Backend Integration
          </h2>
          <p style={{ fontSize: "12px", color: "#6b7280" }}>
            Connect your admin panel via API Key &amp; Secret Token
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: "8px 16px",
            border: "1px solid #7c3aed",
            borderRadius: "8px",
            background: "#7c3aed",
            color: "white",
            cursor: "pointer",
            fontSize: "14px",
            whiteSpace: "nowrap",
          }}
        >
          Connect
        </button>
      </div>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ background: "white", borderRadius: "1rem", padding: "2rem", minWidth: "300px" }}>
            <h3 style={{ fontWeight: 700, marginBottom: "1rem" }}>Connect Backend</h3>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>Modal working!</p>
            <button
              onClick={() => setOpen(false)}
              style={{ marginTop: "1rem", padding: "8px 16px", cursor: "pointer" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
