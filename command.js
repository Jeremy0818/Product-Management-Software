
const printTable = (data) => {
    console.log(data);
    console.table(data);
}

const unexpectedFailure = (err) => {
    // unexpected error happened when executing sqlite query
    console.error(err.message);
    process.exit(1); // exit program
}

module.exports = class Command {
    constructor(dbHelper, readline) {
        this.readline = readline;
        this.dbHelper = dbHelper;
    }

    addProduct(productName, sku) {
        /*
        Command format:
        ADD PRODUCT "PRODUCT NAME" SKU
        
        This command adds a new product to our product catalog.
        We can have products with the same names but not the same SKU.
    
        Arguments:
            "PRODUCT NAME" - STRING (Do not store the enclosing quotes they are there for us to be
                             able to pass in space seperated product names.
            SKU - Unique Identifier.
        */
        // Nothing to output if the product is added successfully
        const readline = this.readline;
        const dbHelper = this.dbHelper;
        return new Promise((resolve, reject) => {
            dbHelper.insertProduct(productName, sku, resolve, resolve);
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
    
    addWarehouse(warehouseNum, stockLimit) {
        /*
        Command format:
        ADD WAREHOUSE WAREHOUSE# [STOCK_LIMIT]
    
        Creates a new warehouse where we can stock products.
        We assume that our warehouses can store infinitely many products if an optional stock limit
        argument is not specified.
    
        Argument:
            WAREHOUSE# - INTEGER
            STOCK_LIMIT - Optional, INTEGER
        */
        // Validate argument type
        const readline = this.readline;
        const dbHelper = this.dbHelper;
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
            dbHelper.insertWarehouse(warehouseNumInt, stockLimitInt, resolve, resolve);
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
    
    stock(sku, warehouseNum, qty) {
        /*
        Command format:
        STOCK SKU WAREHOUSE# QTY
    
        Stocks QTY amount of product with SKU in WAREHOUSE# warehouse.
    
        Argument:
            SKU - Unique Identifier, must be a valid sku (is in product catalog).
            Warehouse# - INTEGER, must be a valid warehouse number
            QTY - Integer
        
        If a store has a stock limit that will be exceeded by this shipment, ship enough product so that
        the Stock Limit is fulfilled.
        */
        // Validate argument type
        const readline = this.readline;
        const dbHelper = this.dbHelper;
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
            //  Case 1: sku does not exist in stock
            //     (i) insert product with quantity allowed if there is a limit
            //     (ii) insert as many product as requested
            return new Promise ((resolve, reject) => {
                dbHelper.insertProductInWarehouse(sku, warehouseNumInt, available, resolve, resolve);
            }).then((res) => {
                if (res) { // failed
                    let err = res;
                    if (err.errno === 19) {
                        console.log("ERROR STOCKING WAREHOUSE with SKU " 
                        + sku + "\nPRODUCT DOES NOT EXIST");
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
                dbHelper.updateProductInWarehouse(sku, warehouseNumInt, qty + available, resolve, unexpectedFailure);
            }).then(() => {
                readline.prompt();
            });
        }
    
        function checkProduct(available) {
            return new Promise ((resolve, reject) => {
                // check if product exists in warehouse by excuting a query for the product
                dbHelper.getProductInWarehouse(sku, warehouseNumInt, resolve, unexpectedFailure);
            }).then(async (result) => {
                if (!result) { //  sku does not exist in the warehouse's stock
                    await case1(available);
                } else { // sku exists in the warehouse's stock
                    await case2(available, result.QTY);
                }
            });
        }
    
        function getTotalProducts(limit) {
            return new Promise ((resolve, reject) => {
                dbHelper.getSumProductInWarehouse(warehouseNumInt, resolve, unexpectedFailure);
            }).then((total) => {
                // get the total stock quantity in the corresponding warehouse
                if (!total) { // warehouse is empty
                    total = 0;
                }
                // calculate for available space
                return limit ? (limit > qtyInt + total ? qtyInt : limit - total) : qtyInt; 
            }).then(async (available) => {
                await checkProduct(available);
            });
        }
    
        return new Promise((resolve, reject) => {
            // check if warehouse exists by excuting a query for limit
            dbHelper.getWarehouseLimit(warehouseNumInt, resolve, unexpectedFailure);
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
    
    unstock(sku, warehouseNum, qty) {
        /*
        Command format:
        UNSTOCK SKU WAREHOUSE# QTY
    
        Unstocks QTY amount of product with SKU in WAREHOUSE# warehouse.
    
        Arguments:
            SKU - Unique Identifier, must be a valid sku (is in product catalog).
            Warehouse# - INTEGER, must be a valid warehouse number
            QTY - Integer
        
        If a store has a stock that will go below 0 for this shipment only unstock enough products so
        stock stays at 0.
        */
        // Validate argument type
        const readline = this.readline;
        const dbHelper = this.dbHelper;
        let warehouseNumInt = parseInt(warehouseNum);
        let qtyInt = parseInt(qty);
        if (isNaN(warehouseNumInt)) {
            return new Promise((resolve, reject) => {
                console.log("ERROR UNSTOCKING WAREHOUSE with WAREHOUSE# " 
                + warehouseNum + "\nWAREHOUSE# NOT INTEGER");
                readline.prompt();
                resolve();
            });
        }
        if (isNaN(qtyInt)) {
            return new Promise((resolve, reject) => {
                console.log("ERROR UNSTOCKING WAREHOUSE with QTY " 
                + qty + "\nQTY NOT INTEGER");
                readline.prompt();
                resolve();
            });
        }
    
        function checkProduct() {
            return new Promise ((resolve, reject) => {
                // check if product exists in warehouse by excuting a query for the product
                dbHelper.getProductInWarehouse(sku, warehouseNumInt, resolve, unexpectedFailure);
            }).then(async (result) => {
                if (!result) { //  sku does not exist in the warehouse's stock
                    console.log("ERROR UNSTOCKING WAREHOUSE with SKU " 
                    + sku + "\nPRODUCT DOES NOT EXIST");
                    readline.prompt();
                } else { // sku exists in the warehouse's stock
                    await new Promise((resolve, reject) => {
                        dbHelper.updateProductInWarehouse(
                            sku, warehouseNumInt, Math.max(result.QTY - qtyInt, 0), 
                            resolve, unexpectedFailure);
                    }).then(() => {
                        readline.prompt();
                    });
                }
            });
        }
    
        function getTotalProducts(limit) {
            return new Promise ((resolve, reject) => {
                dbHelper.getSumProductInWarehouse(warehouseNumInt, resolve, unexpectedFailure);
            }).then((total) => {
                // get the total stock quantity in the corresponding warehouse
                if (!total) { // warehouse is empty
                    readline.prompt();
                    return null; // nothing to unstock
                }
                // calculate for available space
                return limit ? (limit > qtyInt + total ? qtyInt : limit) : qtyInt; 
            }).then(async (available) => {
                if (available) await checkProduct();
            });
        }
    
        return new Promise((resolve, reject) => {
            // check if warehouse exists by excuting a query for limit
            dbHelper.getWarehouseLimit(warehouseNumInt, resolve, unexpectedFailure);
        }).then(async (limit) => {
            if (limit !== undefined) { // warehouse exists
                await getTotalProducts(limit);
            } else {
                console.log("ERROR UNSTOCKING WAREHOUSE with WAREHOUSE# " 
                + warehouseNumInt + "\nWAREHOUSE DOES NOT EXIST");
                readline.prompt();
                return false;
            }
        });
    }
    
    listProducts() {
        /*
        Command format:
        LIST PRODUCTS
    
        List all products in the product catalog.
        */
        const readline = this.readline;
        const dbHelper = this.dbHelper;
        return new Promise ((resolve, reject) => {
            dbHelper.getAllProduct(resolve, unexpectedFailure);
        }).then((result) => {
            printTable(result);
            readline.prompt();
        });
    }
    
    listWarehouses() {
        /*
        Command format:
        LIST WAREHOUSES
    
        List all warehouses.
        */
        const readline = this.readline;
        const dbHelper = this.dbHelper;
        return new Promise ((resolve, reject) => {
            dbHelper.getAllWarehouse(resolve, unexpectedFailure);
        }).then((result) => {
            printTable(result);
            readline.prompt();
        });
    }
    
    listWarehouse(warehouseNum) {
        /*
        Command format:
        LIST WAREHOUSE WAREHOUSE#*
    
        List information about the warehouse with the given warehouse# along with a listing of all
        products stocked in the warehouse.
    
        Arguments:
            Warehouse# - INTEGER, must be a valid warehouse number
        */
        const readline = this.readline;
        const dbHelper = this.dbHelper;
        let warehouseNumInt = parseInt(warehouseNum);
        if (isNaN(warehouseNumInt)) {
            return new Promise((resolve, reject) => {
                console.log("ERROR LISTING WAREHOUSE with WAREHOUSE# " 
                + warehouseNum + "\nWAREHOUSE# NOT INTEGER");
                readline.prompt();
                resolve();
            });
        }
        
        return new Promise ((resolve, reject) => {
            // check if warehouse exists by excuting a query for limit
            dbHelper.getWarehouseLimit(warehouseNumInt, resolve, unexpectedFailure);
        }).then(async (limit) => {
            if (limit !== undefined) { // warehouse exists
                return new Promise ((resolve, reject) => {
                    dbHelper.getProductsInWarehouse(warehouseNumInt, resolve, unexpectedFailure);
                }).then((result) => {
                    if (result) printTable(result);
                    readline.prompt();
                });
            } else {
                console.log("ERROR LISTING WAREHOUSE with WAREHOUSE# " 
                + warehouseNumInt + "\nWAREHOUSE DOES NOT EXIST");
                readline.prompt();
            }
        });
    }
}
