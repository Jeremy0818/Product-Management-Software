const command = require('./command');

const addProductFormat = `    ADD PRODUCT "PRODUCT NAME" SKU`;
const addWarehouseFormat = `    ADD WAREHOUSE WAREHOUSE# [STOCK_LIMIT]`;
const stockFormat = `    STOCK SKU WAREHOUSE# QTY`;
const unstockFormat = `    UNSTOCK SKU WAREHOUSE# QTY`;
const listProductsFormat = `    LIST PRODUCTS`;
const listWarehousesFormat = `    LIST WAREHOUSES`;
const listWarehouseFormat = `    LIST WAREHOUSE`;

function printErrorMessage(errMsg, formats) {
    console.log(errMsg + '\n');
    for (let i = 0 ; i < formats.length ; i++) {
        console.log(formats[i]);
    }
    console.log();
}

function handleCommand(line) {
    // removes whitespace from both ends of a string 
    // allow lower case command
    args = line.trim().toLowerCase().split(" ");
    // check arguments
    // run command
    switch(args[0]) {
        case 'add':
            if (args.length < 2) {
                printErrorMessage("Invalid command, similar commands are:",
                [addProductFormat, addWarehouseFormat]);
                break;
            }
            if (args[1].localeCompare("product") === 0) {
                if (args.length < 4) {
                    printErrorMessage("Invalid argument, the command format is:",
                    [addProductFormat]);
                    break;
                }
                command.addProduct(args[2], args[3]);
            } else if (args[1].localeCompare("warehouse") === 0) {
                if (args.length < 3) {
                    printErrorMessage("Invalid argument, the command format is:",
                    [addWarehouseFormat]);
                    break;
                }
                command.addWarehouse(args[2], args.length > 3 ? args[3] : null);
            } else {
                // console.log(invalidCommandMessage);
                printErrorMessage("Invalid command, commands available are:",
                [addProductFormat, addWarehouseFormat, stockFormat, unstockFormat,
                     listProductsFormat, listWarehouseFormat, listWarehousesFormat])
            }
            
            break;
        case 'stock':
            if (args.length < 4) {
                printErrorMessage("Invalid argument, similar commands are:",
                [stockFormat]);
                break;
            }
            command.stock(args[1], args[2], args[3]);
            break;
        case 'unstock':
            if (args.length < 2) {
                printErrorMessage("Invalid argument, similar commands are:",
                [unstockFormat]);
                break;
            }
            command.unstock(args[1], args[2], args[3]);
            break;
        case 'list':
            if (args.length < 2) {
                printErrorMessage("Invalid command, similar commands are:",
                [listProductsFormat, listWarehouseFormat, listWarehousesFormat]);
                break;
            }
            if (args[1].localeCompare("products") === 0) {
                command.listProducts();
            } else if (args[1].localeCompare("warehouses") === 0) {
                command.listWarehouses();
            } else if (args[1].localeCompare("warehouse") === 0) {
                command.listWareouse();
            } else {
                printErrorMessage("Invalid command, commands available are:",
                [addProductFormat, addWarehouseFormat, stockFormat, unstockFormat,
                     listProductsFormat, listWarehouseFormat, listWarehousesFormat])
            }
            break;
        default:
            printErrorMessage("Invalid command, commands available are:",
                [addProductFormat, addWarehouseFormat, stockFormat, unstockFormat,
                     listProductsFormat, listWarehouseFormat, listWarehousesFormat])
        break;
    }
}

module.exports = {handleCommand};