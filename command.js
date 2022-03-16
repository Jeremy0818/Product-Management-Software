function addProduct(productName, sku) {
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
}

function addWarehouse(warehouseNum, stockLimit) {
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
}

function stock(sku, warehouseNum, qty) {
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
}

function unstock(sku, warehouseNum, qty) {
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
}

function listProducts() {
    /*
    Command format:
    LIST PRODUCTS

    List all products in the product catalog.
    */
}

function listWarehouses() {
    /*
    Command format:
    LIST WAREHOUSES

    List all warehouses.
    */
}

function listWareouse() {
    /*
    Command format:
    LIST WAREHOUSE WAREHOUSE#*

    List information about the warehouse with the given warehouse# along with a listing of all
    products stocked in the warehouse.
    */
}

module.exports = {addProduct, addWarehouse, stock, unstock, listProducts, listWarehouses, listWareouse};