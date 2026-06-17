const CACHE_NAME = "control-calidad-v49";

const LOCAL_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./config.js",
  "./src/data/app-data.js",
  "./src/features/auth.js",
  "./src/features/aseo.js",
  "./src/services/records-store.js",
  "./src/services/export-records.js",
  "./manifest.webmanifest",
  "./app-icon.svg",
];

const OPTIONAL_ASSETS = [
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css",
  "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(LOCAL_ASSETS);
      await Promise.allSettled(OPTIONAL_ASSETS.map((asset) => cache.add(asset)));
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  const isLocalAsset = requestUrl.origin === self.location.origin;
  const isOptionalAsset = OPTIONAL_ASSETS.some((asset) => event.request.url === asset);
  if (!isLocalAsset && !isOptionalAsset) return;

  event.respondWith(
    caches.match(event.request).then(async (cachedResponse) => {
      const cleanLocalUrl = isLocalAsset
        ? new URL(requestUrl.pathname, self.location.origin).href
        : "";
      const cleanCachedResponse = cleanLocalUrl ? await caches.match(cleanLocalUrl) : null;

      const networkUpdate = fetch(event.request)
        .then((networkResponse) => {
          const responseCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseCopy);
            if (cleanLocalUrl) cache.put(cleanLocalUrl, networkResponse.clone());
          });
          return networkResponse;
        })
        .catch(() => null);

      if (cachedResponse || cleanCachedResponse) return cachedResponse || cleanCachedResponse;

      return networkUpdate.then((networkResponse) => {
        if (networkResponse) return networkResponse;
        if (event.request.mode === "navigate") return caches.match("./index.html");
        return Response.error();
      });
    })
  );
});
