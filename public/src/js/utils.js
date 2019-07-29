const dbPromise = idb.openDB("post-store", 1, {
  upgrade(db) {
    // Create a store of objects
    const store = db.createObjectStore("posts", {
      // The 'id' property of the object will be the key.
      keyPath: "id",
      // If it isn't explicitly set, create a value by auto incrementing.
      autoIncrement: true
    });
    // Create an index on the 'date' property of the objects.
    // store.createIndex('date', 'date');
  }
});

function writeData(st, data) {
  return dbPromise
    .then(db => {
      // console.log("Getting DB");
      const tx = db.transaction(st, "readwrite");
      const store = tx.objectStore(st);
      const dataArray = Array.isArray(data) ? data : [data];
      dataArray.forEach(d => {
        // console.log("Adding data to DB");
        store.add(d);
      });
      return tx.done;
    })
    .catch(e => console.log("Error getting db: " + e));
}

function readAllData(st) {
  return dbPromise.then(db => {
    return db.getAll(st);
  });
}

function clearAllData(st) {
  return dbPromise.then(db => {
    const tx = db.transaction(st, "readwrite");
    const store = tx.objectStore(st);
    store.clear();
    return tx.done;
  });
}

function deleteItemData(st, id) {
  return dbPromise.then(db => {
    const tx = db.transaction(st, "readwrite");
    const store = tx.objectStore(st);
    store.delete(id);
    return tx.done;
  });
}
