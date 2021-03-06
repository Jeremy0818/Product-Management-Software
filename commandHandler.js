const Command = require('./command');
const FileHelper = require("./fileHelper");

const fileHelper = new FileHelper("history.log");

const addProductFormat = `    ADD PRODUCT "PRODUCT NAME" SKU`;
const addWarehouseFormat = `    ADD WAREHOUSE WAREHOUSE# [STOCK_LIMIT]`;
const stockFormat = `    STOCK SKU WAREHOUSE# QTY`;
const unstockFormat = `    UNSTOCK SKU WAREHOUSE# QTY`;
const listProductsFormat = `    LIST PRODUCTS`;
const listWarehousesFormat = `    LIST WAREHOUSES`;
const listWarehouseFormat = `    LIST WAREHOUSE WAREHOUSE#*`;

function printErrorMessage(errMsg, formats, readline) {
    console.log(errMsg + '\n');
    for (let i = 0 ; i < formats.length ; i++) {
        console.log(formats[i]);
    }
    console.log();
    readline.prompt();
}

function handleCommand(line, dbHelper, readline) {
    const command = new Command(dbHelper, readline);

    // removes whitespace from both ends of a string 
    // regex: match words and quotations
    var args = line.trim().match(/"[^"]+"|[a-z0-9]+(-*[a-z0-9]+)+|[a-zA-Z]+|[0-9]+/gm);
    if (!args) {
        printErrorMessage("Invalid command, commands available are:",
                [addProductFormat, addWarehouseFormat, stockFormat, unstockFormat,
                     listProductsFormat, listWarehousesFormat, listWarehouseFormat], readline);
        return;
    }
    let i = args.length;
    while (i--) {
        // remove quotation mark
        args[i] = args[i].replace(/"/g,"");
    }
    // log command to history
    fileHelper.addCommand(line);
    // check arguments
    // run command
    switch(args[0].toLowerCase()) { // allow lower case command
        case 'add':
            if (args.length < 2) {
                printErrorMessage("Invalid command, similar commands are:",
                [addProductFormat, addWarehouseFormat], readline);
                break;
            }
            if (args[1].toLowerCase().localeCompare("product") === 0) {
                if (args.length < 4) {
                    printErrorMessage("Invalid argument, the command format is:",
                    [addProductFormat], readline);
                    break;
                }
                command.addProduct(args[2], args[3]);
            } else if (args[1].toLowerCase().localeCompare("warehouse") === 0) {
                if (args.length < 3) {
                    printErrorMessage("Invalid argument, the command format is:",
                    [addWarehouseFormat], readline);
                    break;
                }
                command.addWarehouse(args[2], args.length > 3 ? args[3] : null);
            } else {
                // console.log(invalidCommandMessage);
                printErrorMessage("Invalid command, commands available are:",
                [addProductFormat, addWarehouseFormat, stockFormat, unstockFormat,
                     listProductsFormat, listWarehousesFormat, listWarehouseFormat], readline);
            }
            
            break;
        case 'stock':
            if (args.length < 4) {
                printErrorMessage("Invalid argument, similar commands are:",
                [stockFormat], readline);
                break;
            }
            command.stock(args[1], args[2], args[3]);
            break;
        case 'unstock':
            if (args.length < 2) {
                printErrorMessage("Invalid argument, similar commands are:",
                [unstockFormat], readline);
                break;
            }
            command.unstock(args[1], args[2], args[3]);
            break;
        case 'list':
            if (args.length < 2) {
                printErrorMessage("Invalid command, similar commands are:",
                [listProductsFormat, listWarehouseFormat, listWarehousesFormat], readline);
                break;
            }
            if (args[1].toLowerCase().localeCompare("products") === 0) {
                command.listProducts();
            } else if (args[1].toLowerCase().localeCompare("warehouses") === 0) {
                command.listWarehouses();
            } else if (args[1].toLowerCase().localeCompare("warehouse") === 0) {
                if (args.length < 3) {
                    printErrorMessage("Invalid argument, the command format is:",
                    [listWarehouseFormat], readline);
                    break;
                }
                command.listWarehouse(args[2]);
            } else {
                printErrorMessage("Invalid command, commands available are:",
                [addProductFormat, addWarehouseFormat, stockFormat, unstockFormat,
                     listProductsFormat, listWarehousesFormat, listWarehouseFormat], readline);
            }
            break;
        default:
            printErrorMessage("Invalid command, commands available are:",
                [addProductFormat, addWarehouseFormat, stockFormat, unstockFormat,
                     listProductsFormat, listWarehousesFormat, listWarehouseFormat], readline);
        break;
    }
}

module.exports = {handleCommand};
