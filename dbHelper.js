function setuptable(db, success, failure) {
    db.serialize(() => {
        // Queries scheduled here will be serialized.
        productTableSql = `
        CREATE TABLE IF NOT EXISTS product(
            SKU VARCHAR(50) PRIMARY KEY,
            product_name VARCHAR(200) NOT NULL
        )`;
        warehouseTableSql = `
        CREATE TABLE IF NOT EXISTS warehouse(
            warehouse_num INTEGER PRIMARY KEY,
            limit_qty INTEGER
        )`;
        stockTableSql = `
        CREATE TABLE IF NOT EXISTS stock(
            warehouse_num INTEGER NOT NULL,
            SKU VARCHAR(50) NOT NULL,
            qty INTEGER NOT NULL,
            PRIMARY KEY (warehouse_num, SKU),
            FOREIGN KEY (warehouse_num) references warehouse,
            FOREIGN KEY (SKU) references product
        )`;
        db.run(`PRAGMA foreign_keys = ON;`);
        db.run(productTableSql, (err) => {
            if (err) {
                return failure(err);
                
            }
            db.run(warehouseTableSql, (err) => {
                if (err) {
                    return failure(err);
                    
                }
                db.run(stockTableSql, (err) => {
                    if (err) {
                        return failure(err);
                        
                    }
                    console.log("Tables created sucessfully");
                    success();
                })
            })
        });
    });
}

function insertProduct(db, product_name, sku, success, failure) {
    // insert one row into the product table
    sql = `INSERT INTO product(SKU, product_name) VALUES (?, ?)`;
    db.run(sql, [sku, product_name], function(err) {
        if (err) {
            failure(err);
            return;
        }
        success();
    });
}

function getAllProduct(db, success, failure) {
    // get the product catalog
    sql = `SELECT product_name as ITEM_NAME, SKU as ITEM_SKU FROM product`;
    db.all(sql, [], function(err, rows) {
        if (err) {
            return failure(err);
        }
        success(rows);
    });
}

function insertWarehouse(db, warehouse_num, limit, success, failure) {
    // insert one row into the warehouse table
    sql = `INSERT INTO warehouse(warehouse_num, limit_qty) VALUES (?, ?)`;
    db.run(sql, [warehouse_num, limit], function(err) {
        if (err) {
            return failure(err);
        }
        success();
    });
}

function getAllWarehouse(db, success, failure) {
    // get the warehouse catalog
    sql = `SELECT warehouse_num as WAREHOUSE FROM warehouse`;
    db.all(sql, [], function(err, rows) {
        if (err) {
            return failure(err);
        }
        success(rows);
    });
}

function insertProductInWarehouse(db, sku, warehouse_num, qty, success, failure) {
    // insert one row into the warehouse table
    sql = `INSERT INTO stock(warehouse_num, SKU, qty) VALUES (?, ?, ?)`;
    db.run(sql, [warehouse_num, sku, qty], function(err) {
        if (err) {
            return failure(err);
        }
        success();
    });
}

function updateProductInWarehouse(db, sku, warehouse_num, qty, success, failure) {
    // update one row in the stock table based on warehouse_num and sku
    sql = `UPDATE stock SET qty=? WHERE warehouse_num=? AND SKU=?`;
    db.run(sql, [qty, warehouse_num, sku], function(err) {
        if (err) {
            return failure(err);
        }
        success();
    });
}

function removeProductInWarehouse(db, sku, warehouse_num, success, failure) {
    // delete one row in teh stock table based on warehouse_num and sku
    sql = `DELETE FROM stock WHERE warehouse_num=? AND SKU=?`;
    db.run(sql, [ warehouse_num, sku], function(err) {
        if (err) {
            return failure(err);
        }
        success();
    });
}

function getProductsInWarehouse(db, warehouse_num, success, failure) {
    // get the warehouse's product list and quantity
    sql = `SELECT product.product_name as ITEM_NAME, product.SKU as ITEM_SKU, stock.qty as QTY
            FROM stock
            JOIN product ON stock.SKU = product.SKU
            WHERE stock.warehouse_num=?`;
    db.all(sql, [warehouse_num], function(err, rows) {
        if (err) {
            return failure(err);
        }
        success(rows);
    });
}

function getProductInWarehouse(db, sku, warehouse_num, success, failure) {
    // get the warehouse's product list and quantity
    sql = `SELECT product.product_name as ITEM_NAME, product.SKU as ITEM_SKU, stock.qty as QTY
            FROM stock
            JOIN product ON stock.SKU = product.SKU
            WHERE stock.warehouse_num=? AND stock.SKU=?`;
    db.get(sql, [warehouse_num, sku], function(err, row) {
        if (err) {
            return failure(err);
        }
        success(row);
    });
}

function getSumProductInWarehouse(db, warehouse_num, success, failure) {
    // get the total quantity of a warehouse's products
    sql = `SELECT sum(qty) as total
            FROM stock
            WHERE warehouse_num=?`;
    db.get(sql, [warehouse_num], function(err, row) {
        if (err) {
            return failure(err);
        }
        if (row) success(row.total);
        else success(undefined);
    });
}

function getWarehouseLimit(db, warehouse_num, success, failure) {
    sql = `SELECT limit_qty
            FROM warehouse
            WHERE warehouse_num=?`;
    db.get(sql, [warehouse_num], function(err, row) {
        if (err) {
            return failure(err);
        }
        if (row) success(row.limit_qty);
        else success(undefined);
    });
}


module.exports = {setuptable,
                  getAllProduct,
                  insertProduct,
                  getAllWarehouse,
                  insertWarehouse,
                  insertProductInWarehouse,
                  updateProductInWarehouse,
                  removeProductInWarehouse,
                  getProductInWarehouse,
                  getProductsInWarehouse,
                  getSumProductInWarehouse,
                  getWarehouseLimit};