// Kill-switch: previous SW versions aggressively cached static chunks and caused
// hydration mismatches after deploys. This SW deletes all caches it can find and
// then unregisters itself. After the next page reload everything will be served
// fresh from the network.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch (e) {
        // best effort
      }
      try {
        await self.registration.unregister();
      } catch (e) {
        // best effort
      }
      const clientList = await self.clients.matchAll({ type: "window" });
      for (const client of clientList) {
        client.navigate(client.url).catch(() => {});
      }
    })()
  );
});

// Network-only for everything in the meantime
self.addEventListener("fetch", (event) => {
  // Don't intercept — let the browser hit the network directly.
});
