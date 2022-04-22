//create variable to hold db connection
let db;
//establish a connection to IndexedDB & set to version 1
const request = indexedDB.open('budget101', 1);

//this event will emit if the version changes (non-existant to version 1, v1 to v2)
request.onupgradeneeded = function(event) {
 // save a reference to the database
 const db = event.target.result;
 //create an object store called budget101 et it to have an auto incrementing primary key of sorts
 db.createObjectStore('budget101', {autoIncrement: true});

 //upon a successfull
 request.onsuccess = function(event) {
     //when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.results;
    // check if app is online, if yes run uploadBudget() function to send all local db data to api
    if (navigator.onLine) {
        uploadBudget();
    }
 }
};
request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
  };
  
  function saveRecord(record) {
      //open a new transaction with the db with read and write permissions
      const transaction = db.transaction(['budget101'], 'readwrite');

      //access the object store for 'budget101'
      const budgetObjectStore = transaction.objectStore("budget101");

      //add record to your store with add method
      budgetObjectStore.add(record);

  };

  function uploadBudget() {
      //open a transaction on db
      const transaction = db.transaction(["budget101"], 'readwrite');

      //access your object store
      const budgetObjectStore = transaction.objectStore("budget101");
      
      //get all records from store and set to a variable
      const getAll = budgetObjectStore.getAll();

      //upon successful
      getAll.onsuccess = function () {
          // if there was data in indexedDb, send to api server
          if (getAll.result.length > 0) {
              fetch ("/api/budget101",{
                  method: "POST",
                  body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          
          // open one more transaction
          const transaction = db.transaction(["budget101"], 'readwrite');

          // access the new_budget object store
          const budgetObjectStore = transaction.objectStore("budget101");

          // clear all items in your store
          budgetObjectStore.clear();

          alert("All saved budget has been submitted!");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

window.addEventListener('online', uploadBudget);
     