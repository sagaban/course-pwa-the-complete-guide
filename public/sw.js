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
      cache.add("/");
      // We cache REQUESTs, so, we need to cache `/` to store the `index.html`
      cache.add("/index.html");
      cache.add("/src/js/app.js");
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
