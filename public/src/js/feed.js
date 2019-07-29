var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");
const POSTS_URL =
  "https://course-pwa-the-complete-guide.firebaseio.com/posts.json";

function openCreatePostModal() {
  createPostArea.style.transform = "translateY(0)";
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
  createPostArea.style.transform = "translateY(100vh)";
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

/*
// Not in use: allow us to save assets on demand
function onSaveButtonClicked(event) {
  // Cache the card when user click save button.
  if ("caches" in window) {
    caches.open("user-requested").then(cache => {
      cache.add("https://httpbin.org/get");
      cache.add("/src/images/sf-boat.jpg");
    });
  } else {
    //Maybe remove the Save button
  }
}
*/

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement("div");
  cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";
  var cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  cardTitle.style.backgroundImage = `url("${data.image}")`;
  cardTitle.style.backgroundSize = "cover";
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.style.color = "white";
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = "center";
  // var cardSaveButton = document.createElement("button");
  // cardSaveButton.textContent = "Save";
  // cardSaveButton.addEventListener("click", onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
  data.forEach(datum => createCard(datum));
}

// CACHE STRATEGIES
// Cache, then network (see SW part)
let networkDataReceived = false;

if ("indexedDB" in window) {
  readAllData("posts").then(data => {
    if (!networkDataReceived) {
      console.log("Creating card from indexedDB");
      updateUI(data);
    }
  });
}
fetch(POSTS_URL)
  .then(res => res.json())
  .then(data => {
    if (data) {
      networkDataReceived = true;
      setTimeout(() => {
        console.log("Creating card from network");
        clearCards();
        updateUI(Object.values(data));
      }, 1500);
    }
  })
  .catch(err => {
    console.warn(`Error fetching ${POSTS_URL}: ${err}`);
  });
