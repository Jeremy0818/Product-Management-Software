const sqlite3 = require('sqlite3').verbose();
const commandHandler = require("./commandhandler");
const dbHelper = require("./dbHelper");

var db;

function run() {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // open the database
    db = new sqlite3.Database('./product.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the product database.');

        // Start the program
        dbHelper.setuptable(db);
        readline.setPrompt('> ');
        readline.prompt();
    });
    
    readline.on('line', function(line) {
        commandHandler.handleCommand(line, db)
        readline.prompt();
    }).on('close', function() {
        console.log('Have a great day!');

        // close the databse before ending the program
        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Close the database connection.');
        });
        process.exit(0);
    });
}

run();