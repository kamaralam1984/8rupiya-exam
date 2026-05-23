// 8Rupia service worker — push + offline fallback.
// Kept intentionally minimal: does NOT cache hashed Next.js chunks (those caused
// hydration mismatches after deploys in earlier versions). Only handles:
//   1. Push notifications
//   2. Notification click → focus/open the target URL
//   3. Top-level navigation offline fallback to /offline

const OFFLINE_URL = "/offline";
const STATIC_CACHE = "8r-static-v2";
const STATIC_ASSETS = [OFFLINE_URL, "/manifest.webmanifest", "/favicon.ico"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      try { await cache.addAll(STATIC_ASSETS); } catch (_) {}
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  // Only intercept top-level navigations for offline fallback. Everything else
  // goes straight to network so hashed chunks always match the current deploy.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(req);
        } catch (_) {
          const cache = await caches.open(STATIC_CACHE);
          const cached = await cache.match(OFFLINE_URL);
          return cached ?? Response.error();
        }
      })()
    );
  }
});

self.addEventListener("push", (event) => {
  let data = { title: "8Rupia", body: "You have an update.", url: "/" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (_) {}
  const opts = {
    body: data.body,
    icon: "/icon-192.png",
    badge: "/icon-96.png",
    data: { url: data.url ?? "/" },
    tag: data.tag ?? "8r-default",
    renotify: true,
  };
  event.waitUntil(self.registration.showNotification(data.title, opts));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const c of all) {
        if ("focus" in c) { c.navigate(url).catch(() => {}); return c.focus(); }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })()
  );
});
