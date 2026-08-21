const CACHE_VERSION = "tedx-arcade-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith("tedx-arcade-") && key !== CACHE_VERSION).map((key) => caches.delete(key)),
    )),
  );
  self.clients.claim();
});

// Keep the worker intentionally network-first. Authentication, run tickets,
// leaderboards, and PBs must never be served from a stale offline cache.
self.addEventListener("fetch", () => {});
