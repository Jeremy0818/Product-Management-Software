const dbHelper = require("./dbHelper");

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
            console.log("ERROR ADDING PRODUCT PRODUCT with SKU " + sku);
            console.log("ALREADY EXISTS")
            readline.prompt();
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
    const success = () => { readline.prompt(); };
    const failure = (err) => {
        if (err.errno === 19) {
            console.log("ERROR ADDING PRODUCT PRODUCT with SKU " + sku);
            console.log("ALREADY EXISTS")
        }
        readline.prompt();
    }
   dbHelper.insertWarehouse(db, warehouseNum, stockLimit, success, failure);
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
    const success = () => { readline.prompt(); };
    const failure = () => { readline.prompt(); }
    dbHelper.insertProductInWarehouse(db, sku, warehouseNum, qty, success, failure);
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
    readline.prompt();
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
        console.table(result);
        readline.prompt();
    }
    // the program should not call the failure callback function
    const failure = (err) => { readline.prompt(); };
    dbHelper.getAllProduct(db, success, failure);
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
        console.table(result);
        readline.prompt();
    }
    // the program should not call the failure callback function
    const failure = (err) => { readline.prompt(); };
    dbHelper.getAllWarehouse(db, success, failure);
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
        console.table(result);
        readline.prompt();
    }
    // the program should not call the failure callback function
    const failure = (err) => { readline.prompt(); };
    dbHelper.getProducdtInWarehouse(db, warehouseNum, success, failure);
}

module.exports = {addProduct, addWarehouse, stock, unstock, listProducts, listWarehouses, listWarehouse};