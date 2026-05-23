"use client";
import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  VideoConference,
  GridLayout,
  ParticipantTile,
  useTracks,
  RoomAudioRenderer,
  ControlBar,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Loader2, Radio, AlertTriangle, User as UserIcon, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { useUser } from "@/lib/use-user";
import Link from "next/link";

type TokenResp = { token: string; wsUrl: string; identity: string; role: "host" | "viewer" };

export function LiveRoomClient({ roomName }: { roomName: string }) {
  const { user, loading } = useUser();
  const [token, setToken] = useState<string | null>(null);
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [role, setRole] = useState<"host" | "viewer">("viewer");
  const [err, setErr] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  async function join(asHost: boolean) {
    setErr(null);
    setJoining(true);
    const r = await api<TokenResp>("/api/live/token", {
      method: "POST",
      body: JSON.stringify({ roomName, role: asHost ? "host" : "viewer" }),
    });
    setJoining(false);
    if (!r.ok) {
      setErr(
        r.error.code === "UNAUTHENTICATED" ? "Sign in to join."
        : r.error.code === "LIVEKIT_MISSING" ? "Streaming server config missing. Admin needs to set LIVEKIT_API_KEY env."
        : r.error.message ?? "Failed",
      );
      return;
    }
    setToken(r.data.token);
    setWsUrl(r.data.wsUrl);
    setRole(r.data.role);
  }

  if (loading) {
    return <div className="neon-card p-10 text-center"><Loader2 className="h-8 w-8 mx-auto animate-spin text-brand-500" /></div>;
  }

  if (!token || !wsUrl) {
    return (
      <div className="neon-card p-8">
        <Radio className="h-8 w-8 text-rose-500" />
        <h2 className="mt-4 font-display text-xl font-bold">Ready to join?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Camera + mic permission lagega host ke liye. Viewers ko sirf audio output chahiye.
        </p>
        {err && (
          <p className="mt-3 text-sm text-rose-500 inline-flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" /> {err}
          </p>
        )}
        <div className="mt-5 flex gap-3 flex-wrap">
          <Button onClick={() => join(false)} disabled={joining} className="btn-ai">
            {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserIcon className="h-4 w-4" />} Join as viewer
          </Button>
          {user?.role === "ADMIN" && (
            <Button onClick={() => join(true)} disabled={joining} variant="outline">
              <Mic className="h-4 w-4" /> Host (admin)
            </Button>
          )}
          <Link href="/community" className="btn-ghost-ai">Back to community</Link>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Streaming powered by <a href="https://livekit.io" target="_blank" className="underline">LiveKit</a>.
          Free tier: ~50 min/mo. Set env: <code className="font-mono">LIVEKIT_API_KEY</code>, <code className="font-mono">LIVEKIT_API_SECRET</code>, <code className="font-mono">NEXT_PUBLIC_LIVEKIT_URL</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="neon-card p-2 overflow-hidden" style={{ height: "70vh", minHeight: 480 }} data-lk-theme="default">
      <LiveKitRoom
        token={token}
        serverUrl={wsUrl}
        connect
        audio={role === "host"}
        video={role === "host"}
        style={{ height: "100%" }}
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}
