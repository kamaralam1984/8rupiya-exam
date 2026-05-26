import { api } from "@/lib/api-client";

export type ConnectState = "idle" | "connecting" | "success" | "error";

export interface ConnectPayload {
  websiteUrl: string;
  apiKey: string;
  secretToken: string;
}

export function connectWebsite(payload: ConnectPayload) {
  return api("/api/connect-website", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "X-API-Key": payload.apiKey,
    },
  });
}
