const dbHelper = require("./dbHelper");

const printTable = (data) => {
    console.table(data);
}

const unexpectedFailure = (err) => {
    // unexpected error happened when executing sqlite query
    console.error(err.message);
    process.exit(0); // exit program
}

function addProduct(db, readline, productName, sku) {
    /*
    Command format:
    ADD PRODUCT "PRODUCT NAME" SKU
    
    This command adds a new product to our product catalog.
    We can have products with the same names but not the same SKU.

    Arguments:
        db - database object used in the program
        "PRODUCT NAME" - STRING (Do not store the enclosing quotes they are there for us to be
                         able to pass in space seperated product names.
        SKU - Unique Identifier.
    */
    // Nothing to output if the product is added successfully
    const success = () => { readline.prompt(); };
    const failure = (err) => {
        if (err.errno === 19) {
            console.log("ERROR ADDING PRODUCT with SKU " + sku);
            console.log("ALREADY EXISTS")
            readline.prompt();
        } else {
            unexpectedFailure(err);
        }
    }
    dbHelper.insertProduct(db, productName, sku, success, failure);
}

function addWarehouse(db, readline, warehouseNum, stockLimit) {
    /*
    Command format:
    ADD WAREHOUSE WAREHOUSE# [STOCK_LIMIT]

    Creates a new warehouse where we can stock products.
    We assume that our warehouses can store infinitely many products if an optional stock limit
    argument is not specified.

    Argument:
        db - database object used in the program
        WAREHOUSE# - INTEGER
        STOCK_LIMIT - Optional, INTEGER
    */
    // Validate argument type
    let warehouseNumInt = parseInt(warehouseNum);
    let stockLimitInt = parseInt(stockLimit);
    if (warehouseNumInt === null) {
        console.log("ERROR ADDING WAREHOUSE with WAREHOUSE# " + warehouseNum);
        console.log("WAREHOUSE# NOT INTEGER");
        readline.prompt();
        return;
    }
    if (stockLimit)  {
        if (stockLimitInt === null) {
            console.log("ERROR ADDING WAREHOUSE with STOCK_LIMIT " + stockLimit);
            console.log("STOCK_LIMIT NOT INTEGER");
            readline.prompt();
            return;
        }
    }
    const success = () => { readline.prompt(); };
    const failure = (err) => {
        if (err.errno === 19) {
            console.log("ERROR ADDING WAREHOUSE with WAREHOUSE# " + warehouseNumInt);
            console.log("ALREADY EXISTS");
            readline.prompt();
        } else {
            unexpectedFailure(err);
        }
    }
   dbHelper.insertWarehouse(db, warehouseNumInt, stockLimitInt, success, failure);
}

function stock(db, readline, sku, warehouseNum, qty) {
    /*
    Command format:
    STOCK SKU WAREHOUSE# QTY

    Stocks QTY amount of product with SKU in WAREHOUSE# warehouse.

    Argument:
        db - database object used in the program
        SKU - Unique Identifier, must be a valid sku (is in product catalog).
        Warehouse# - INTEGER, must be a valid warehouse number
        QTY - Integer
    
    If a store has a stock limit that will be exceeded by this shipment, ship enough product so that
    the Stock Limit is fulfilled.
    */
    // Validate argument type
    let warehouseNumInt = parseInt(warehouseNum);
    let qtyInt = parseInt(qty);
    if (warehouseNumInt === null) {
        console.log("ERROR STOCKING WAREHOUSE with WAREHOUSE# " + warehouseNum);
        console.log("WAREHOUSE# NOT INTEGER");
        readline.prompt();
        return;
    }
    if (qtyInt === null) {
        console.log("ERROR STOCKING WAREHOUSE with QTY " + qty);
        console.log("QTY NOT INTEGER");
        readline.prompt();
        return;
    }
    // check if warehouse exists and get its limit
    const getSuccess = (limit) => {
        if (limit !== undefined) { // warehouse exists
    //      get the total stock quantity in the corresponding warehouse
            const sumSuccess = (total) => {
                if (!total) { // warehouse is empty
                    total = 0;
                }
                let available = limit ? (limit > qtyInt + total ? qtyInt : limit) : qtyInt;
                const checkSuccess = (result) => {
                    if (!result) { //  sku does not exists in the warehouse's stock
    //      Case 1: sku does not exists in stock
    //          (i) insert product with quantity allowed if there is a limit
    //          (ii) insert as many product as requested
                        const insertSuccess = () => { readline.prompt(); };
                        const insertFail = (err) => {
                            if (err.errno === 19) {
                                console.log("ERROR STOCKING WAREHOUSE with SKU " + sku);
                                console.log("PRODUCT DOES NOT EXISTS");
                                readline.prompt();
                            } else {
                                unexpectedFailure(err);
                            }
                        }
                        dbHelper.insertProductInWarehouse(db, sku, warehouseNumInt, available, insertSuccess, insertFail);
                    } else { // sku exists in the warehouse's stock
    //      Case 2: sku exists in stock
    //          (i) update product with quantity allowed if there is a limit
    //          (ii) update as many product as requested 
                        const updateSuccess = () => { readline.prompt(); };
                        dbHelper.updateProductInWarehouse(db, sku, warehouseNumInt, result.QTY + available, updateSuccess, unexpectedFailure);
                    }
                }
                dbHelper.getProductInWarehouse(db, sku, warehouseNumInt, checkSuccess, unexpectedFailure);
            };
            dbHelper.getSumProductInWarehouse(db, warehouseNumInt, sumSuccess, unexpectedFailure);
        } else {
            console.log("ERROR STOCKING WAREHOUSE with WAREHOUSE# " + warehouseNumInt);
            console.log("WAREHOUSE DOES NOT EXIST");
            readline.prompt(); 
        }
    };
    dbHelper.getWarehouseLimit(db, warehouseNumInt, getSuccess, unexpectedFailure);
}

function unstock(db, readline, sku, warehouseNum, qty) {
    /*
    Command format:
    UNSTOCK SKU WAREHOUSE# QTY

    Unstocks QTY amount of product with SKU in WAREHOUSE# warehouse.

    Arguments:
        db - database object used in the program
        SKU - Unique Identifier, must be a valid sku (is in product catalog).
        Warehouse# - INTEGER, must be a valid warehouse number
        QTY - Integer
    
    If a store has a stock that will go below 0 for this shipment only unstock enough products so
    stock stays at 0.
    */
    // Validate argument type
    let warehouseNumInt = parseInt(warehouseNum);
    let qtyInt = parseInt(qty);
    if (warehouseNumInt === null) {
        console.log("ERROR STOCKING WAREHOUSE with WAREHOUSE# " + warehouseNum);
        console.log("WAREHOUSE# NOT INTEGER");
        readline.prompt();
        return;
    }
    if (qtyInt === null) {
        console.log("ERROR STOCKING WAREHOUSE with QTY " + qty);
        console.log("QTY NOT INTEGER");
        readline.prompt();
        return;
    }
    // check if warehouse exists
    const getSuccess = (limit) => { 
        if (limit !== undefined) { // warehouse exists
    //      get the total stock quantity in the corresponding warehouse
            const sumSuccess = (total) => {
                if (!total) { // warehouse is empty
                    readline.prompt();
                    return; // nothing to unstock
                }
                const checkSuccess = (result) => {
                    if (!result) { //  sku does not exists in the warehouse's stock
                        console.log("ERROR UNSTOCKING WAREHOUSE with SKU " + sku);
                        console.log("PRODUCT DOES NOT EXISTS");
                        readline.prompt();
                    } else { // sku exists in the warehouse's stock
                        const updateSuccess = () => { readline.prompt(); };
                        dbHelper.updateProductInWarehouse(db, sku, warehouseNumInt, Math.max(result.QTY - qtyInt, 0), updateSuccess, unexpectedFailure);
                    }
                }
                dbHelper.getProductInWarehouse(db, sku, warehouseNumInt, checkSuccess, unexpectedFailure);
            };
            dbHelper.getSumProductInWarehouse(db, warehouseNumInt, sumSuccess, unexpectedFailure);
        } else {
            console.log("ERROR UNSTOCKING WAREHOUSE with WAREHOUSE# " + warehouseNumInt);
            console.log("WAREHOUSE DOES NOT EXIST");
            readline.prompt(); 
        }
    };
    dbHelper.getWarehouseLimit(db, warehouseNumInt, getSuccess, unexpectedFailure);
}

function listProducts(db, readline) {
    /*
    Command format:
    LIST PRODUCTS

    List all products in the product catalog.

    Arguments:
        db - database object used in the program
    */
    const success = (result) => {
        printTable(result);
        readline.prompt();
    }
    dbHelper.getAllProduct(db, success, unexpectedFailure);
}

function listWarehouses(db, readline) {
    /*
    Command format:
    LIST WAREHOUSES

    List all warehouses.

    Arguments:
        db - database object used in the program
    */
    const success = (result) => {
        printTable(result);
        readline.prompt();
    }
    dbHelper.getAllWarehouse(db, success, unexpectedFailure);
}

function listWarehouse(db, readline, warehouseNum) {
    /*
    Command format:
    LIST WAREHOUSE WAREHOUSE#*

    List information about the warehouse with the given warehouse# along with a listing of all
    products stocked in the warehouse.

    Arguments:
        db - database object used in the program
    */
    const success = (result) => {
        printTable(result);
        readline.prompt();
    };
    let warehouseNumInt = parseInt(warehouseNum);
    if (warehouseNumInt === null) {
        console.log("ERROR STOCKING WAREHOUSE with WAREHOUSE# " + warehouseNum);
        console.log("WAREHOUSE# NOT INTEGER");
        readline.prompt();
        return;
    }
    dbHelper.getProductsInWarehouse(db, warehouseNumInt, success, unexpectedFailure);
}

module.exports = {
    addProduct, 
    addWarehouse, 
    stock, 
    unstock, 
    listProducts, 
    listWarehouses, 
    listWarehouse};