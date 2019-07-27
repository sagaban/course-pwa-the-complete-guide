self.addEventListener("install", event => {
  console.log("[Service Worker] Installing Service Worker...", event);
  /**
   * Service worker takes controls from the next page-reload after its
   * registration. By using self.skipWaiting() and self.clients.claim(), you can
   * ask the client to take control over service worker on the first load
   * itself.
   */
  // self.skipWaiting();

  // Cache API
  // Open or create
  event.waitUntil(
    caches.open("static").then(cache => {
      console.log("[Service Worker] Precaching App Shell");
      // With add, we execute the request to fetch the resource
      // We cache REQUESTs, so, we need to cache `/` to store the `index.html`
      cache.addAll([
        "/",
        "/index.html",
        "/src/js/app.js",
        "/src/js/feed.js",
        // If polyfills are needed, SW is not supported. No need to cache.
        // Should conditionally loaded in our work flow
        // Added for performance issues
        "/src/js/promise.js",
        "/src/js/fetch.js",
        "/src/js/material.min.js",
        "/src/css/app.css",
        "/src/css/feed.css",
        "/src/images/main-image.jpg",
        // Maybe the icons, it depends
        "https://fonts.googleapis.com/css?family=Roboto:400,700",
        "https://fonts.googleapis.com/icon?family=Material+Icons",
        "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css"
      ]);
    })
  );
});

self.addEventListener("activate", event => {
  console.log("[Service Worker] Activating Service Worker...", event);
  // You can take control of uncontrolled clients by calling clients.claim()
  // within your service worker once it's activated.
  return self.clients.claim();
});

self.addEventListener("fetch", event => {
  // console.log("[Service Worker] Fetching something...", event.request.url);
  // Override what's is being respond. Null will make site unavailable
  // event.respondWith(null);
  event.respondWith(
    caches.match(event.request).then(response => {
      // It always resolves the promise, even if the request is not cached
      if (response) {
        return response;
      } else {
        return fetch(event.request);
      }
    })
  );
});
