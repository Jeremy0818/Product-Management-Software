module.exports = class DbHelper {
    constructor(db) {
        this.db = db;
    }

    setuptable(success, failure) {
        const db = this.db;
        db.serialize(() => {
            // Queries scheduled here will be serialized.
            let productTableSql = `
            CREATE TABLE IF NOT EXISTS product(
                SKU VARCHAR(50) PRIMARY KEY,
                product_name VARCHAR(200) NOT NULL
            )`;
            let warehouseTableSql = `
            CREATE TABLE IF NOT EXISTS warehouse(
                warehouse_num INTEGER PRIMARY KEY,
                limit_qty INTEGER
            )`;
            let stockTableSql = `
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
                        // console.log("Tables created sucessfully");
                        success();
                    })
                })
            });
        });
    }
    
    insertProduct(product_name, sku, success, failure) {
        // insert one row into the product table
        let sql = `INSERT INTO product(SKU, product_name) VALUES (?, ?)`;
        this.db.run(sql, [sku, product_name], function(err) {
            if (err) {
                failure(err);
                return;
            }
            success();
        });
    }
    
    getAllProduct(success, failure) {
        // get the product catalog
        let sql = `SELECT product_name as ITEM_NAME, SKU as ITEM_SKU FROM product`;
        this.db.all(sql, [], function(err, rows) {
            if (err) {
                return failure(err);
            }
            success(rows);
        });
    }
    
    insertWarehouse(warehouse_num, limit, success, failure) {
        // insert one row into the warehouse table
        let sql = `INSERT INTO warehouse(warehouse_num, limit_qty) VALUES (?, ?)`;
        this.db.run(sql, [warehouse_num, limit], function(err) {
            if (err) {
                return failure(err);
            }
            success();
        });
    }
    
    getAllWarehouse(success, failure) {
        // get the warehouse catalog
        let sql = `SELECT warehouse_num as WAREHOUSE FROM warehouse`;
        this.db.all(sql, [], function(err, rows) {
            if (err) {
                return failure(err);
            }
            success(rows);
        });
    }
    
    insertProductInWarehouse(sku, warehouse_num, qty, success, failure) {
        // insert one row into the warehouse table
        let sql = `INSERT INTO stock(warehouse_num, SKU, qty) VALUES (?, ?, ?)`;
        this.db.run(sql, [warehouse_num, sku, qty], function(err) {
            if (err) {
                return failure(err);
            }
            success();
        });
    }
    
    updateProductInWarehouse(sku, warehouse_num, qty, success, failure) {
        // update one row in the stock table based on warehouse_num and sku
        let sql = `UPDATE stock SET qty=? WHERE warehouse_num=? AND SKU=?`;
        this.db.run(sql, [qty, warehouse_num, sku], function(err) {
            if (err) {
                return failure(err);
            }
            success();
        });
    }
    
    removeProductInWarehouse(sku, warehouse_num, success, failure) {
        // delete one row in teh stock table based on warehouse_num and sku
        let sql = `DELETE FROM stock WHERE warehouse_num=? AND SKU=?`;
        this.db.run(sql, [ warehouse_num, sku], function(err) {
            if (err) {
                return failure(err);
            }
            success();
        });
    }
    
    getProductsInWarehouse(warehouse_num, success, failure) {
        // get the warehouse's product list and quantity
        let sql = `SELECT product.product_name as ITEM_NAME, product.SKU as ITEM_SKU, stock.qty as QTY
                FROM stock
                JOIN product ON stock.SKU = product.SKU
                WHERE stock.warehouse_num=?`;
        this.db.all(sql, [warehouse_num], function(err, rows) {
            if (err) {
                return failure(err);
            }
            success(rows);
        });
    }
    
    getProductInWarehouse(sku, warehouse_num, success, failure) {
        // get the warehouse's product list and quantity
        let sql = `SELECT product.product_name as ITEM_NAME, product.SKU as ITEM_SKU, stock.qty as QTY
                FROM stock
                JOIN product ON stock.SKU = product.SKU
                WHERE stock.warehouse_num=? AND stock.SKU=?`;
        this.db.get(sql, [warehouse_num, sku], function(err, row) {
            if (err) {
                return failure(err);
            }
            success(row);
        });
    }
    
    getSumProductInWarehouse(warehouse_num, success, failure) {
        // get the total quantity of a warehouse's products
        let sql = `SELECT sum(qty) as total
                FROM stock
                WHERE warehouse_num=?`;
        this.db.get(sql, [warehouse_num], function(err, row) {
            if (err) {
                return failure(err);
            }
            if (row) success(row.total);
            else success(undefined);
        });
    }
    
    getWarehouseLimit(warehouse_num, success, failure) {
        let sql = `SELECT limit_qty
                FROM warehouse
                WHERE warehouse_num=?`;
        this.db.get(sql, [warehouse_num], function(err, row) {
            if (err) {
                return failure(err);
            }
            if (row) success(row.limit_qty);
            else success(undefined);
        });
    }
}
