const sqlite3 = require('sqlite3').verbose();
const commandHandler = require("./commandhandler");
const dbHelper = require("./dbHelper");

function run() {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // open the database
    let db = new sqlite3.Database(':memory:', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the product database.');

        // Start the program
        const success = () => {
            readline.setPrompt('> ');
            readline.prompt();
        }
        // the program should not call the failure callback function
        const failure = (err) => {
            console.error(err.message);
            process.exit(1);
        };
        dbHelper.setuptable(db, success, failure);
    });
    
    readline.on('line', function(line) {
        commandHandler.handleCommand(line, db, readline);
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