let deferredPrompt;

if (!window.Promise) {
  window.Promise = Promise;
}

/**
 * The Navigator interface represents the state and the identity of the user
 * agent. It allows scripts to query it and to register themselves to carry on
 * some activities.
 */
if ("serviceWorker" in navigator) {
  // `{ scope: "/help/" }` could be passed as second argument to define the SW scope
  // It only works with restrictive (more specific) scopes
  navigator.serviceWorker
    .register("/sw.js")
    .then(() => {
      console.log("Service worker registered!");
    })
    .catch(error => {
      console.error("Error registering Service Worker: ", error);
    });
}
window.addEventListener("beforeinstallprompt", event => {
  // console.log("beforeinstallprompt triggered...");
  // Prevent Chrome <= 67 from automatically showing the prompt
  event.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = event;
  return false;
});

/*
In case we want/need to unregister a SW

navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for (let registration of registrations) {
    registration.unregister();
  }
});
*/
