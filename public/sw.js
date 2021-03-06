importScripts("/src/js/idb.js");
importScripts("/src/js/utils.js");

const CACHE_STATIC_NAME = "static-v5";
const CACHE_DYNAMIC_NAME = "dynamic-v4";
const POSTS_GET_URL =
  "https://course-pwa-the-complete-guide.firebaseio.com/posts.json";
const POSTS_POST_URL =
  "https://us-central1-course-pwa-the-complete-guide.cloudfunctions.net/storePostData";

self.addEventListener("install", event => {
  console.log("[Service Worker] Installing Service Worker...");
  /**
   * Service worker takes controls from the next page-reload after its
   * registration. By using self.skipWaiting() and self.clients.claim(), you can
   * ask the client to take control over service worker on the first load
   * itself.
   */
  self.skipWaiting();

  // Cache API
  // Open or create
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then(cache => {
      console.log("[Service Worker] Precaching App Shell");
      // With add, we execute the request to fetch the resource
      // We cache REQUESTs, so, we need to cache `/` to store the `index.html`
      cache.addAll([
        "/",
        "/index.html",
        "/offline.html",
        "/src/js/utils.js",
        "/src/js/app.js",
        "/src/js/feed.js",
        "/src/js/idb.js",
        // If polyfills are needed, SW is not supported. No need to cache.
        // Should conditionally loaded in our work flow
        // Added for performance issues
        "/src/js/promise.js",
        "/src/js/fetch.js",
        "/src/js/material.min.js",
        "/src/css/app.css",
        "/src/css/feed.css",
        // We only cache the medium size image just to no blow or cache. Deal with it.
        "/src/images/main-image.jpg",
        // Maybe the icons, it depends
        "https://fonts.googleapis.com/css?family=Roboto:400,700",
        "https://fonts.googleapis.com/icon?family=Material+Icons",
        "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css"
      ]);
    })
  );
});

// function trimCache(cacheName, maxItems) {
//   caches.open(cacheName).then(cache =>
//     cache.keys().then(keys => {
//       if (keys.length > maxItems) {
//         for (let i = 0; i < keys.length - maxItems; i++) {
//           cache.delete(keys[i]);
//         }
//       }
//     })
//   );
// }

self.addEventListener("activate", event => {
  console.log("[Service Worker] Activating Service Worker...");
  // You can take control of uncontrolled clients by calling clients.claim()
  // within your service worker once it's activated.

  // Here we clean the cache because is where the user close all pages, all tabs
  // and open a new application
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log("[Service Worker] Removing old cache: ", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Cache, fallback to network + Generic fallback strategy
// self.addEventListener("fetch", event => {
//   // console.log("[Service Worker] Fetching something...", event.request.url);
//   // Override what's is being respond. Null will make site unavailable
//   // event.respondWith(null);
//   event.respondWith(
//     // Look trough all the cached keys, so, have to manage cache versions
//     caches.match(event.request).then(response => {
//       // It always resolves the promise, even if the request is not cached
//       if (response) {
//         return response;
//       } else {
//         return fetch(event.request)
//           .then(res => {
//             return caches.open(CACHE_DYNAMIC_NAME).then(cache => {
//               // If the response was good, clone it and store it in the cache.
//               if (res.status === 200) {
//                 // We have to clone so we don't consume the response
//                 cache.put(event.request.url, res.clone());
//               }
//               return res;
//             });
//           })
//           .catch(err => {
//             // We couldn't fetch the page from tne network
//             // We will show the offline page
//             return caches.open(CACHE_STATIC_NAME).then(cache => {
//               // If we try to make an API call to get a JSON, we are also
//               // returning this file
//               return cache.match("/offline.html");
//             });
//           });
//       }
//     })
//   );
// });

// OTHER CACHE STRATEGIES

//Cache Only
// self.addEventListener("fetch", event => {
//   event.respondWith(caches.match(event.request));
// });

//Network Only
// self.addEventListener("fetch", event => {
//   event.respondWith(fetch(event.request));
// });

// Network falling back to cache
// self.addEventListener("fetch", event => {
//   event.respondWith(
//     fetch(event.request)
//       // Optional: Dynamic cache
//       .then(res => {
//         return caches.open(CACHE_DYNAMIC_NAME).then(cache => {
//           if (res.status === 200) {
//             cache.put(event.request.url, res.clone());
//           }
//           return res;
//         });
//       })
//       .catch(err => {
//         return caches.match(event.request);
//       })
//   );
// });

// Cache, then network (see feed.js part) + cache fallback network + Generic fallback
self.addEventListener("fetch", event => {
  if (event.request.url.includes(POSTS_GET_URL)) {
    event.respondWith(
      fetch(event.request).then(res => {
        const clonedRes = res.clone();
        clonedRes.json().then(data => {
          clearAllData("posts").then(() =>
            writeData("posts", Object.values(data))
          );
        });
        return res;
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(res => {
              return caches.open(CACHE_DYNAMIC_NAME).then(cache => {
                // trimCache(CACHE_DYNAMIC_NAME, 20);
                cache.put(event.request.url, res.clone());
                return res;
              });
            })
            .catch(err => {
              return caches.open(CACHE_STATIC_NAME).then(cache => {
                // Filter the request that can return the offline page
                if (event.request.headers.get("accept").includes("text/html")) {
                  return cache.match("/offline.html");
                }
              });
            });
        }
      })
    );
  }
});

self.addEventListener("sync", event => {
  console.log("[Service worker] Background syncing");
  // We could use a `switch` if there are more tags
  if (event.tag === "sync-new-posts") {
    console.log("[Service worker] Syncing new Posts");
    event.waitUntil(
      readAllData("sync-posts").then(data => {
        for (let dt of data) {
          fetch(POSTS_POST_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json"
            },

            body: JSON.stringify({
              ...dt,
              image:
                "https://firebasestorage.googleapis.com/v0/b/course-pwa-the-complete-guide.appspot.com/o/sf-boat.jpg?alt=media&token=b18c5fa9-3037-4117-911f-228a935c3558"
            })
          })
            .then(res => {
              console.log("[Service worker] Sent data: ", res);
              if (res.ok) {
                res.json().then(resData => {
                  deleteItemData("sync-posts", resData.id);
                });
              }
            })
            .catch(err => {
              console.log("[Service worker] Error while sending data: ", err);
            });
        }
      })
    );
  }
});
