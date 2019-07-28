var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");

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

function createCard(from) {
  var cardWrapper = document.createElement("div");
  cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";
  var cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  cardTitle.style.backgroundImage = 'url("/src/images/sf-boat.jpg")';
  cardTitle.style.backgroundSize = "cover";
  cardTitle.style.height = "180px";
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.style.color = "white";
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = "San Francisco Trip " + from;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = "In San Francisco";
  cardSupportingText.style.textAlign = "center";
  // var cardSaveButton = document.createElement("button");
  // cardSaveButton.textContent = "Save";
  // cardSaveButton.addEventListener("click", onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

// fetch("https://httpbin.org/get")
//   .then(function(res) {
//     return res.json();
//   })
//   .then(function(data) {
//     createCard();
//   });

// CACHE STRATEGIES
// Cache, then network (see SW part)
const url = "https://httpbin.org/get";
let networkDataReceived = false;

if ("caches" in window) {
  caches
    .match(url)
    .then(cache => {
      if (cache) {
        return cache.json();
      }
    })
    .then(() => {
      console.log("Creating card from cache");
      if (!networkDataReceived) {
        clearCards();
        createCard("Cache");
        networkDataReceived = false;
      }
    });
}
fetch(url)
  .then(res => res.json())
  .then(() => {
    networkDataReceived = true;
    setTimeout(() => {
      console.log("Creating card from network");
      clearCards();
      createCard("Network");
    }, 1500);
  });
