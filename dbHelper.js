const sqlite3 = require('sqlite3').verbose();

function setuptable(db) {
    db.serialize(() => {
        // Queries scheduled here will be serialized.
        productTableSql = `
        CREATE TABLE IF NOT EXISTS product(
            SKU VARCHAR(50) PRIMARY KEY,
            product_name VARCHAR(50) NOT NULL
        )`;
        warehouseTableSql = `
        CREATE TABLE IF NOT EXISTS warehouse(
            warehouse_num INTEGER PRIMARY KEY,
            limit_qty INTEGER
        )`;
        stockTableSql = `
        CREATE TABLE IF NOT EXISTS stock(
            warehouse_num INTEGER,
            SKU VARCHAR(50),
            qty INTEGER NOT NULL,
            PRIMARY KEY (warehouse_num, SKU),
            FOREIGN KEY (warehouse_num) references warehouse,
            FOREIGN KEY (SKU) references product
        )`;
        db.run(productTableSql)
        .run(warehouseTableSql)
        .run(stockTableSql);
    });
}

function insertProduct(db, product_name, sku) {
    // insert one row into the product table
    sql = `INSERT INTO product(SKU, product_name) VALUES (?, ?)`;
    db.run(sql, [sku, product_name], function(err) {
        if (err) {
            return console.log(err.message);
        }
    });
}

function getAllProduct(db) {
    // get the product catalog
    sql = `SELECT * FROM product`;
    db.run(sql, [], function(err, rows) {
        if (err) {
            return console.log(err.message);
        }
        rows.forEach((row) => {
            console.log(row.name);
        });
    });
}

function insertWarehouse(db, warehouse_num, limit) {
    // insert one row into the warehouse table
    sql = `INSERT INTO warehouse(warehouse_num, limit_qty) VALUES (?, ?)`;
    db.run(sql, [warehouse_num, limit], function(err) {
        if (err) {
            return console.log(err.message);
        }
    });
}

function getAllWarehouse(db) {
    // get the warehouse catalog
    sql = `SELECT * FROM warehouse`;
    db.all(sql, [], function(err, rows) {
        if (err) {
            return console.log(err.message);
        }
        rows.forEach((row) => {
            console.log(row.name);
        });
    });
}

function insertProductInWarehouse(db, sku, warehouse_num, qty) {
    // insert one row into the warehouse table
    sql = `INSERT INTO stock(warehouse_num, SKU, qty) VALUES (?, ?, ?)`;
    db.run(sql, [warehouse_num, sku, qty], function(err) {
        if (err) {
            return console.log(err.message);
        }
    });
}

function updateProductInWarehouse(db, sku, warehouse_num, qty) {
    // update one row in the stock table based on warehouse_num and sku
    sql = `UPDATE stock SET qty=? WHERE SKU=? AND warehouse_num=?`;
    db.run(sql, [qty, warehouse_num, sku], function(err) {
        if (err) {
            return console.log(err.message);
        }
    });
}

function removeProductInWarehouse(db, sku, warehouse_num, qty) {
    // delete one row in teh stock table based on warehouse_num and sku
    sql = `DELETE FROM stock WHERE warehouse_num=? AND SKU=?`;
    db.run(sql, [ warehouse_num, sku], function(err) {
        if (err) {
            return console.log(err.message);
        }
    });
}

function getProducdtInWarehouse(db, sku, warehouse_num) {
    // get the warehouse's product list and quantity
    sql = `SELECT * FROM stock WHERE warehouse_num=? AND SKU=?`;
    db.all(sql, [], function(err, rows) {
        if (err) {
            return console.log(err.message);
        }
        rows.forEach((row) => {
            console.log(row.name);
        });
    });
}


module.exports = {setuptable};