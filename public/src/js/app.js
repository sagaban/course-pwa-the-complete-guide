// The Navigator interface represents the state and the identity of the user agent. It allows
// scripts to query it and to register themselves to carry on some activities.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then(() => {
    console.log("Service worker registered!");
  });
}
