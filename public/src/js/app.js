// The Navigator interface represents the state and the identity of the user agent. It allows
// scripts to query it and to register themselves to carry on some activities.
if ("serviceWorker" in navigator) {
  // `{ scope: "/help/" }` could be passed as second argument to define the SW scope
  // It only works with restrictive (more specific) scopes
  navigator.serviceWorker.register("/sw.js").then(() => {
    console.log("Service worker registered!");
  });
}
