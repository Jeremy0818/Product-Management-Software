const sqlite3 = require('sqlite3').verbose();

// open the database
let db = new sqlite3.Database('./db/product.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the product database.');
});


db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
});