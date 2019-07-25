var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);

function openCreatePostModal() {
  createPostArea.style.display = "block";
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
}

function closeCreatePostModal() {
  createPostArea.style.display = "none";
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);
