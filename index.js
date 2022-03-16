const commandHandler = require("./commandhandler");

function run() {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    readline.setPrompt('> ');
    readline.prompt();
    
    readline.on('line', function(line) {
        commandHandler.handleCommand(line)
        readline.prompt();
    }).on('close', function() {
        console.log('Have a great day!');
        process.exit(0);
    });
}

run();