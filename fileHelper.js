const fs = require('fs');

module.exports = class FileHelper {
    constructor(fileName) {
        this.fileName = fileName;
        this.history = [];
    }

    addCommand(command) {
        // add command to history batch
        this.history.push(command);
        if (this.history.length == 2) {
            // write to file when there is two commands in the history
            return new Promise(resolve => {
                this.writeToFile(resolve);
            });
        }
    }

    writeToFile(resolve) {
        let fd;
        try {
            fd = fs.openSync(this.fileName, 'a');
            let command1 = this.history.shift();
            let command2 = this.history.shift();
            let data = command1 + '\n' + command2 + '\n';
            fs.appendFileSync(fd, data, 'utf8');
        } catch (err) {
            // Handle the error
            console.error(err.message);
        } finally {
            if (fd !== undefined)
                fs.closeSync(fd);
            resolve();
        }
    }

}
