const command = require('./command');

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

function handleCommand(line, db, readline) {
    // removes whitespace from both ends of a string 
    // allow lower case command
    args = line.trim().toLowerCase().split(" ");
    // check arguments
    // run command
    switch(args[0]) {
        case 'add':
            if (args.length < 2) {
                printErrorMessage("Invalid command, similar commands are:",
                [addProductFormat, addWarehouseFormat], readline);
                break;
            }
            if (args[1].localeCompare("product") === 0) {
                if (args.length < 4) {
                    printErrorMessage("Invalid argument, the command format is:",
                    [addProductFormat], readline);
                    break;
                }
                command.addProduct(db, readline, args[2], args[3]);
            } else if (args[1].localeCompare("warehouse") === 0) {
                if (args.length < 3) {
                    printErrorMessage("Invalid argument, the command format is:",
                    [addWarehouseFormat], readline);
                    break;
                }
                command.addWarehouse(db, readline, args[2], args.length > 3 ? args[3] : null);
            } else {
                // console.log(invalidCommandMessage);
                printErrorMessage("Invalid command, commands available are:",
                [addProductFormat, addWarehouseFormat, stockFormat, unstockFormat,
                     listProductsFormat, listWarehouseFormat, listWarehousesFormat], readline)
            }
            
            break;
        case 'stock':
            if (args.length < 4) {
                printErrorMessage("Invalid argument, similar commands are:",
                [stockFormat], readline);
                break;
            }
            command.stock(db, readline, args[1], args[2], args[3]);
            break;
        case 'unstock':
            if (args.length < 2) {
                printErrorMessage("Invalid argument, similar commands are:",
                [unstockFormat], readline);
                break;
            }
            command.unstock(db, readline, args[1], args[2], args[3]);
            break;
        case 'list':
            if (args.length < 2) {
                printErrorMessage("Invalid command, similar commands are:",
                [listProductsFormat, listWarehouseFormat, listWarehousesFormat], readline);
                break;
            }
            if (args[1].localeCompare("products") === 0) {
                command.listProducts(db, readline);
            } else if (args[1].localeCompare("warehouses") === 0) {
                command.listWarehouses(db, readline);
            } else if (args[1].localeCompare("warehouse") === 0) {
                if (args.length < 3) {
                    printErrorMessage("Invalid argument, the command format is:",
                    [listWarehouseFormat], readline);
                    break;
                }
                command.listWarehouse(db, readline, args[2]);
            } else {
                printErrorMessage("Invalid command, commands available are:",
                [addProductFormat, addWarehouseFormat, stockFormat, unstockFormat,
                     listProductsFormat, listWarehouseFormat, listWarehousesFormat], readline)
            }
            break;
        default:
            printErrorMessage("Invalid command, commands available are:",
                [addProductFormat, addWarehouseFormat, stockFormat, unstockFormat,
                     listProductsFormat, listWarehouseFormat, listWarehousesFormat], readline)
        break;
    }
}

module.exports = {handleCommand};