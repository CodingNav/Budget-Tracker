let db;
let budgetVersion;

// Create a new db request for a "budget" database.
const request = indexedDB.open("budget", budgetVersion || 21);

request.onupgradeneeded = (e) => {
    console.log('Upgrade needed in IndexDB');

    const { oldVersion } = e;
    const newVersion = e.newVersion || db.version;

    console.log(`DB Updated from version ${oldVersion} to ${newVersion}`);

    db = e.target.result;

    if (db.objectStoreNames.length === 0) {
        db.createObjectStore("PendingBudget", { autoIncrement: true });
    }
};

request.onerror = (e) => {
    // Log error here
    console.log("Woops!" + e.target.errorCode);
};

const checkDatabase = () => {
    console.log('check db invoked');

    // Open a transaction on your PendingBudget db
    let transaction = db.transaction("PendingBudget", "readwrite");

    // Access your PendingBudget object 
    const store = transaction.objectStore("PendingBudget");

    // Get all records from store and set to a variable
    const getAll = store.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => response.json())
                .then(() => {
                    // If successful, open a transaction on your PendingBudget db
                    transaction = db.transaction("PendingBudget", "readwrite");

                    // access your PendingBudget object store
                    const currentStore = transaction.objectStore("PendingBudget");

                    // clear all items in store
                    currentStore.clear();
                    console.log('Clearing store 🧹');
                });
        }
    };
};

request.onsuccess = function (e) {
    console.log('success');
    db = e.target.result;

    if (navigator.onLine) {
        console.log('Backend online! 🗄️');
        checkDatabase();
    }
};

function saveRecord(record) {
    console.log('Save record invoked');
    // Create a transaction on the PendingBudget db with readwrite access
    const transaction = db.transaction("PendingBudget", "readwrite");

    // Access your PendingBudget object store
    const store = transaction.objectStore("PendingBudget");

    // Add record to your store with add method.
    store.add(record);
};

// listen for app coming back online
window.addEventListener('online', checkDatabase);