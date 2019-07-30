const shareImageButton = document.querySelector("#share-image-button");
const createPostArea = document.querySelector("#create-post");
const closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
const sharedMomentsArea = document.querySelector("#shared-moments");
const form = document.querySelector("form");
const titleInput = document.querySelector("#title");
const locationInput = document.querySelector("#location");

const POSTS_URL =
  "https://course-pwa-the-complete-guide.firebaseio.com/posts.json";

function openCreatePostModal() {
  createPostArea.style.transform = "translateY(0)";
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

function sendNewPost() {
  fetch(POSTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      id: new Date().toISOString(),
      title: titleInput.value,
      location: locationInput.value,
      image:
        "https://firebasestorage.googleapis.com/v0/b/course-pwa-the-complete-guide.appspot.com/o/sf-boat.jpg?alt=media&token=b18c5fa9-3037-4117-911f-228a935c3558"
    })
  }).then(res => {
    console.log("Sent data: ", res);
    updateUI();
  });
}

form.addEventListener("submit", event => {
  event.preventDefault();
  if (titleInput.value.trim() === "" && locationInput.value.trim() === "") {
    alert("Please, insert valid data");
    return;
  }
  closeCreatePostModal();

  if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready.then(sw => {
      const post = {
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value
      };
      writeData("sync-posts", post)
        .then(() => {
          return sw.sync.register("sync-new-posts");
        })
        .then(() => {
          const snackbarContainer = document.querySelector(
            "#confirmation-toast"
          );
          const data = { message: "Your Post has been saved for syncing!" };
          snackbarContainer.MaterialSnackbar.showSnackbar(data);
        })
        .catch(e => {
          console.log("Error sync-ing the new Post");
        });
    });
  } else {
    sendNewPost();
  }
});
