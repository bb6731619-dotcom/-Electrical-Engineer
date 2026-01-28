self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("engineer-tools").then(cache =>
      cache.addAll([
        "/",
        "/index.html",
        "/style.css",
        "/icon-192.png",
        "/icon-512.png"
      ])
    )
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
