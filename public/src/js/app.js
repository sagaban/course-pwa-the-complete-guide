let deferredPrompt;

if (!window.Promise) {
  window.Promise = Promise;
}

const installButton = document.getElementById("installButton");

installButton.addEventListener("click", event => {
  // Check if the PWA install event is stashed.
  if (deferredPrompt) {
    // Show the modal add to home screen dialog
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then(choice => {
      if (choice.outcome === "accepted") {
        // or !== 'dismissed'
        console.log("User accepted the installation");
      } else {
        console.log("User dismissed the installation");
      }
      // Clear the saved prompt since it can't be used again
      deferredPrompt = null;
    });
  }
});

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
  installButton.style.display = "block";
  return false;
});

//In case we want/need to unregister a SW
/*
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}
/** */
