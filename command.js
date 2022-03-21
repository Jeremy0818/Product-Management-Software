const dbHelper = require("./dbHelper");

const printTable = (data) => {
    console.table(data);
}

const unexpectedFailure = (err) => {
    // unexpected error happened when executing sqlite query
    console.error(err.message);
    process.exit(1); // exit program
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
    return new Promise((resolve, reject) => {
        dbHelper.insertProduct(db, productName, sku, resolve, resolve);
    }).then((res) => {
        if (res) { // failed
            let err = res;
            if (err.errno === 19) {
                console.log("ERROR ADDING PRODUCT with SKU " + sku + "\nALREADY EXISTS");
                readline.prompt();
            } else {
                unexpectedFailure(err);
            }
        } else { // success
            readline.prompt();
        }
    });
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
    if (isNaN(warehouseNumInt)) {
        return new Promise((resolve, reject) => {
            console.log("ERROR ADDING WAREHOUSE with WAREHOUSE# " 
            + warehouseNum + "\nWAREHOUSE# NOT INTEGER");
            readline.prompt();
            resolve();
        });
    }

    if (stockLimit)  {
        if (isNaN(stockLimitInt)) {
            return new Promise((resolve, reject) => {
                console.log("ERROR ADDING WAREHOUSE with STOCK_LIMIT " 
                + stockLimit + "\nSTOCK_LIMIT NOT INTEGER");
                readline.prompt();
                resolve();
            });
        }
    }

    return new Promise((resolve, reject) => {
        dbHelper.insertWarehouse(db, warehouseNumInt, stockLimitInt, resolve, resolve);
    }).then((res) => {
        if (res) { // failed
            let err = res;
            if (err.errno === 19) {
                console.log("ERROR ADDING WAREHOUSE with WAREHOUSE# " 
                + warehouseNumInt + "\nALREADY EXISTS");
            } else {
                unexpectedFailure(err);
            }
        } 
        // success
        readline.prompt();
    });
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
    if (isNaN(warehouseNumInt)) {
        return new Promise((resolve, reject) => {
            console.log("ERROR STOCKING WAREHOUSE with WAREHOUSE# " 
            + warehouseNum + "\nWAREHOUSE# NOT INTEGER");
            readline.prompt();
            resolve();
        });
    }

    if (isNaN(qtyInt)) {
        return new Promise((resolve, reject) => {
            console.log("ERROR STOCKING WAREHOUSE with QTY " 
            + qty + "\nQTY NOT INTEGER");
            readline.prompt();
            resolve();
        });
    }

    function case1(available) {
        //  Case 1: sku does not exists in stock
        //     (i) insert product with quantity allowed if there is a limit
        //     (ii) insert as many product as requested
        return new Promise ((resolve, reject) => {
            dbHelper.insertProductInWarehouse(db, sku, warehouseNumInt, available, resolve, resolve);
        }).then((res) => {
            if (res) { // failed
                let err = res;
                if (err.errno === 19) {
                    console.log("ERROR STOCKING WAREHOUSE with SKU " 
                    + sku + "\nPRODUCT DOES NOT EXISTS");
                } else {
                    unexpectedFailure(err);
                }
            } 
            // success
            readline.prompt();
        });
    }

    function case2(available, qty) {
        //  Case 2: sku exists in stock
        //      (i) update product with quantity allowed if there is a limit
        //      (ii) update as many product as requested 
        return new Promise ((resolve, reject) => {
            dbHelper.updateProductInWarehouse(db, sku, warehouseNumInt, qty + available, resolve, unexpectedFailure);
        }).then(() => {
            readline.prompt();
        });
    }

    function checkProduct(available) {
        return new Promise ((resolve, reject) => {
            // check if product exists in warehouse by excuting a query for the product
            dbHelper.getProductInWarehouse(db, sku, warehouseNumInt, resolve, unexpectedFailure);
        }).then(async (result) => {
            if (!result) { //  sku does not exists in the warehouse's stock
                await case1(available);
            } else { // sku exists in the warehouse's stock
                await case2(available, result.QTY);
            }
        });
    }

    function getTotalProducts(limit) {
        return new Promise ((resolve, reject) => {
            dbHelper.getSumProductInWarehouse(db, warehouseNumInt, resolve, unexpectedFailure);
        }).then((total) => {
            // get the total stock quantity in the corresponding warehouse
            if (!total) { // warehouse is empty
                total = 0;
            }
            // calculate for available space
            return limit ? (limit > qtyInt + total ? qtyInt : limit) : qtyInt; 
        }).then(async (available) => {
            await checkProduct(available);
        });
    }

    return new Promise((resolve, reject) => {
        // check if warehouse exists by excuting a query for limit
        dbHelper.getWarehouseLimit(db, warehouseNumInt, resolve, unexpectedFailure);
    }).then( async (limit) => {
        if (limit !== undefined) { // warehouse exists
            await getTotalProducts(limit);
        } else {
            console.log("ERROR STOCKING WAREHOUSE with WAREHOUSE# " 
            + warehouseNumInt + "\nWAREHOUSE DOES NOT EXIST");
            readline.prompt();
            return false;
        }
    });
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
        return new Promise((resolve, reject) => {
            console.log("ERROR STOCKING WAREHOUSE with WAREHOUSE# " 
            + warehouseNum + "\nWAREHOUSE# NOT INTEGER");
            readline.prompt();
            resolve();
        });
    }
    if (qtyInt === null) {
        return new Promise((resolve, reject) => {
            console.log("ERROR STOCKING WAREHOUSE with QTY " 
            + qty + "\nQTY NOT INTEGER");
            readline.prompt();
            resolve();
        });
    }

    function checkProduct(available) {
        return new Promise ((resolve, reject) => {
            // check if product exists in warehouse by excuting a query for the product
            dbHelper.getProductInWarehouse(db, sku, warehouseNumInt, resolve, unexpectedFailure);
        }).then(async (result) => {
            if (!result) { //  sku does not exists in the warehouse's stock
                console.log("ERROR UNSTOCKING WAREHOUSE with SKU " 
                + sku + "\nPRODUCT DOES NOT EXISTS");
                readline.prompt();
            } else { // sku exists in the warehouse's stock
                await new Promise((resolve, reject) => {
                    dbHelper.updateProductInWarehouse(
                        db, sku, warehouseNumInt, Math.max(result.QTY - qtyInt, 0), 
                        resolve, unexpectedFailure);
                }).then(() => {
                    readline.prompt();
                });
            }
        });
    }

    function getTotalProducts(limit) {
        return new Promise ((resolve, reject) => {
            dbHelper.getSumProductInWarehouse(db, warehouseNumInt, resolve, unexpectedFailure);
        }).then((total) => {
            // get the total stock quantity in the corresponding warehouse
            if (!total) { // warehouse is empty
                readline.prompt();
                return null; // nothing to unstock
            }
            // calculate for available space
            return limit ? (limit > qtyInt + total ? qtyInt : limit) : qtyInt; 
        }).then(async (available) => {
            if (available) await checkProduct(available);
        });
    }

    return new Promise((resolve, reject) => {
        // check if warehouse exists by excuting a query for limit
        dbHelper.getWarehouseLimit(db, warehouseNumInt, resolve, unexpectedFailure);
    }).then(async (limit) => {
        if (limit !== undefined) { // warehouse exists
            await getTotalProducts(limit);
        } else {
            console.log("ERROR STOCKING WAREHOUSE with WAREHOUSE# " 
            + warehouseNumInt + "\nWAREHOUSE DOES NOT EXIST");
            console.log();
            readline.prompt();
            return false;
        }
    });
}

function listProducts(db, readline) {
    /*
    Command format:
    LIST PRODUCTS

    List all products in the product catalog.

    Arguments:
        db - database object used in the program
    */
    return new Promise ((resolve, reject) => {
        dbHelper.getAllProduct(db, resolve, unexpectedFailure);
    }).then((result) => {
        printTable(result);
        readline.prompt();
    });
}

function listWarehouses(db, readline) {
    /*
    Command format:
    LIST WAREHOUSES

    List all warehouses.

    Arguments:
        db - database object used in the program
    */
    return new Promise ((resolve, reject) => {
        dbHelper.getAllWarehouse(db, resolve, unexpectedFailure);
    }).then((result) => {
        printTable(result);
        readline.prompt();
    });
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
    let warehouseNumInt = parseInt(warehouseNum);
    if (warehouseNumInt === null) {
        return new Promise((resolve, reject) => {
            console.log("ERROR LISTING WAREHOUSE with WAREHOUSE# " 
            + warehouseNum + "\nWAREHOUSE# NOT INTEGER");
            readline.prompt();
            resolve();
        });
    }
    
    return new Promise ((resolve, reject) => {
        dbHelper.getProductsInWarehouse(db, warehouseNumInt, resolve, unexpectedFailure);
    }).then((result) => {
        printTable(result);
        readline.prompt();
    });
}

module.exports = {
    addProduct, 
    addWarehouse, 
    stock, 
    unstock, 
    listProducts, 
    listWarehouses, 
    listWarehouse};