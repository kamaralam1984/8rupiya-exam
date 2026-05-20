"use client";
import { useEffect, useState } from "react";
import { api } from "./api-client";

export type Me = {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  role: "FREE" | "PREMIUM" | "FAMILY" | "ADMIN";
  xp: number;
  streak: number;
  language: string;
  examTrack: string | null;
  onboardedAt: string | null;
  emailVerifiedAt?: string | null;
};

export function useUser() {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const r = await api<Me>("/api/auth/me");
      if (!active) return;
      setUser(r.ok ? r.data : null);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return { user, loading, setUser };
}
