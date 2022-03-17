const dbHelper = require("../dbHelper");
const sqlite3 = require('sqlite3').verbose();

jest.setTimeout(5000);

var db;
const empty = () => {};

var setup = () => {
    return new Promise((resolve, reject) => {
        // open the database
        db = new sqlite3.Database(':memory:', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
                if (err) {
                    console.error(err.message);
                    return reject();
                }
                dbHelper.setuptable(db, resolve, empty);
            }
        );
    })
};

beforeAll(async () => {
    // wait for the database to setup the tables
    await setup();
});

test("Empty table test", done => {
    db.all("SELECT * FROM product", function(err, rows){
        if (err) {
            console.error(err.message);
        }
        expect(rows.length).toBe(0);
        db.all("SELECT * FROM warehouse", function(err, rows){
            if (err) {
                console.error(err.message);
            }
            expect(rows.length).toBe(0);
            db.all("SELECT * FROM stock", function(err, rows){
                if (err) {
                    console.error(err.message);
                }
                expect(rows.length).toBe(0);
                done();
            });
        });
    });
});

let warehouse_func = (a, b) => {
    return (a.warehouse_num - b.warehouse_num) ? 1 : -1;
};

test("Insert valid warehouse test", done => {
    const next = () => {
        db.all("SELECT * FROM warehouse", function(err, rows){
            if (err) {
                console.error(err.message);
            }
            let expected = [
                { warehouse_num: 2, limit_qty: null },
                { warehouse_num: 45, limit_qty: null },
                { warehouse_num: 970, limit_qty: null }
            ]
            expect(rows.sort(warehouse_func)).toEqual(expected.sort(warehouse_func));
            done();
        });
    }
    dbHelper.insertWarehouse(db, 970, null, empty, empty);
    dbHelper.insertWarehouse(db, 45, null, empty, empty);
    dbHelper.insertWarehouse(db, 2, null, next, empty);
});

test("Insert invalid product test", done => {
    const next = (err) => {
        expect(err.errno).toBe(19);
        done();
    }
    dbHelper.insertWarehouse(db, 2, null, empty, next);
});

test("Select all warehouses test", done => {
    let expected = [
        { warehouse_num: 2, limit_qty: null },
        { warehouse_num: 45, limit_qty: null },
        { warehouse_num: 970, limit_qty: null }
    ];
    const success = (result) => {
        expect(result.sort(warehouse_func)).toEqual(expected.sort(warehouse_func));
        done();
    }
    dbHelper.getAllWarehouse(db, success, empty);
});

let product_func = function (a, b) {
    return (a.SKU - b.SKU) ? 1 : -1;
};

test("Insert valid product test", done => {
    const next = () => {
        db.all("SELECT * FROM product", function(err, rows){
            if (err) {
                console.error(err.message);
            }
            let expected = [
                {
                  SKU: '38538505-0767-453f-89af-d11c809ebb3b',
                  product_name: 'Sofia Vegara 5 Piece Living Room Set'
                },
                { SKU: '5ce956fa-a71e-4bfb-b6ae-5eeaa5eb0a70', product_name: 'BED' }
            ];
            
            expect(rows.sort(product_func)).toEqual(expected.sort(product_func));
            done();
        });
    }
    dbHelper.insertProduct(db, "Sofia Vegara 5 Piece Living Room Set", "38538505-0767-453f-89af-d11c809ebb3b", empty, empty);
    dbHelper.insertProduct(db, "BED", "5ce956fa-a71e-4bfb-b6ae-5eeaa5eb0a70", next, empty);
    
});

test("Insert invalid product test", done => {
    const next = (err) => {
        expect(err.errno).toBe(19);
        done();
    }
    dbHelper.insertProduct(db, "TRUNK", "5ce956fa-a71e-4bfb-b6ae-5eeaa5eb0a70", empty, next);
});

test("Select all products test", done => {
    let expected = [
        {
          SKU: '38538505-0767-453f-89af-d11c809ebb3b',
          product_name: 'Sofia Vegara 5 Piece Living Room Set'
        },
        { SKU: '5ce956fa-a71e-4bfb-b6ae-5eeaa5eb0a70', product_name: 'BED' }
    ];
    const success = (result) => {
        expect(result.sort(product_func)).toEqual(expected.sort(product_func));
        done();
    }
    dbHelper.getAllProduct(db, success, empty);
});

test("Insert valid product and valid warehouse in stock test", done => {
    const next = () => {
        db.get(`SELECT * FROM stock WHERE SKU=? AND warehouse_num=?`,
        ["38538505-0767-453f-89af-d11c809ebb3b",
        970,],
        function(err, row){
            let expected = {
                warehouse_num: 970,
                SKU: '38538505-0767-453f-89af-d11c809ebb3b',
                qty: 1000
            }
            expect(row).toEqual(expected);
            done();
        })
    }
    dbHelper.insertProductInWarehouse(db, 
        "38538505-0767-453f-89af-d11c809ebb3b",
        970,
        1000,
        next,
        empty);
});

test("Insert invalid product and valid warehouse in stock test", done => {
    const next = (err) => {
        expect(err.errno).toBe(19);
        done();
    }
    dbHelper.insertProductInWarehouse(db, 
        "5ce95", 
        970,
        1000,
        empty, 
        next);
});

test("Insert valid product and invalid warehouse in stock test", done => {
    const next = (err) => {
        expect(err.errno).toBe(19);
        done();
    }
    dbHelper.insertProductInWarehouse(db, 
        "38538505-0767-453f-89af-d11c809ebb3b", 
        97,
        1000,
        empty, 
        next);
});

test("Insert invalid product and invalid warehouse in stock test", done => {
    const next = (err) => {
        expect(err.errno).toBe(19);
        done();
    }
    dbHelper.insertProductInWarehouse(db, 
        "38538505", 
        97,
        1000,
        empty, 
        next);
});

test("Insert existing product and warehouse in stock test", done => {
    const next = (err) => {
        expect(err.errno).toBe(19);
        done();
    }
    dbHelper.insertProductInWarehouse(db, 
        "38538505-0767-453f-89af-d11c809ebb3b",
        970,
        1000,
        empty,
        next);
})

test("Update valid product and valid warehouse in stock test", done => {
    const next = () => {
        db.get(`SELECT * FROM stock WHERE SKU=? AND warehouse_num=?`,
        ["38538505-0767-453f-89af-d11c809ebb3b",
        970,],
        function(err, row){
            let expected = {
                warehouse_num: 970,
                SKU: '38538505-0767-453f-89af-d11c809ebb3b',
                qty: 500
            }
            expect(row).toEqual(expected);
            done();
        })
    }
    dbHelper.updateProductInWarehouse(db, 
        "38538505-0767-453f-89af-d11c809ebb3b",
        970,
        500,
        next,
        empty);
});

test("Update invalid product and valid warehouse in stock test", done => {
    const next = () => {
        db.get(`SELECT * FROM stock WHERE SKU=? AND warehouse_num=?`,
        ["38538505-0767-453f-89af-d11c809ebb3b",
        970,],
        function(err, row){
            let expected = {
                warehouse_num: 970,
                SKU: '38538505-0767-453f-89af-d11c809ebb3b',
                qty: 500
            }
            expect(row).toEqual(expected);
            done();
        })
    }
    dbHelper.updateProductInWarehouse(db, 
        "38538505",
        970,
        500,
        next,
        empty);
});

test("Update valid product and invalid warehouse in stock test", done => {
    const next = () => {
        db.get(`SELECT * FROM stock WHERE SKU=? AND warehouse_num=?`,
        ["38538505-0767-453f-89af-d11c809ebb3b",
        970,],
        function(err, row){
            let expected = {
                warehouse_num: 970,
                SKU: '38538505-0767-453f-89af-d11c809ebb3b',
                qty: 500
            }
            expect(row).toEqual(expected);
            done();
        })
    }
    dbHelper.updateProductInWarehouse(db, 
        "38538505-0767-453f-89af-d11c809ebb3b",
        97,
        500,
        next,
        empty);
});

test("Update invalid product and invalid warehouse in stock test", done => {
    const next = () => {
        db.get(`SELECT * FROM stock WHERE SKU=? AND warehouse_num=?`,
        ["38538505-0767-453f-89af-d11c809ebb3b",
        970,],
        function(err, row){
            let expected = {
                warehouse_num: 970,
                SKU: '38538505-0767-453f-89af-d11c809ebb3b',
                qty: 500
            }
            expect(row).toEqual(expected);
            done();
        })
    }
    dbHelper.updateProductInWarehouse(db, 
        "38538505",
        97,
        500,
        next,
        empty);
});

test("Select valid warehouse in stock test", done => {
    const next = (result) =>  {
        let expected = [
            { ITEM_NAME: 'new item', ITEM_SKU: '1', QTY: 1 },
            {
              ITEM_NAME: 'Sofia Vegara 5 Piece Living Room Set',
              ITEM_SKU: '38538505-0767-453f-89af-d11c809ebb3b',
              QTY: 500
            }
        ];
        expect(result).toEqual(expected);
        done();
    }
    const fail = (err) => {
        console.error(err.message);
        done();
    }
    dbHelper.insertProduct(db,
        "new item",
        "1",
        () => {
            dbHelper.insertProductInWarehouse(db,
                "1",
                970,
                1,
                () => {
                    dbHelper.getProducdtInWarehouse(db,
                        970,
                        next,
                        fail);
                },
                fail)
        },
        fail);
});

test("Select invalid warehouse in stock test", done => {
    const next = (result) => {
        expect(result).toEqual([]);
        done();
    }
    dbHelper.getProducdtInWarehouse(db,
        97,
        next,
        empty);
});

test("Get total quantity in a valid warehouse test", done => {
    const next = (result) => {
        expect(result).toBe(500+1);
        done();
    }
    dbHelper.getSumProductInWarehouse(db, 970, next, empty);
})

test("Remove invalid product and invalid warehouse in stock test", done => {
    const next = () => {
        db.get(`SELECT * FROM stock WHERE SKU=? AND warehouse_num=?`,
        ["38538505-0767-453f-89af-d11c809ebb3b",
        970,],
        function(err, row){
            let expected = {
                warehouse_num: 970,
                SKU: '38538505-0767-453f-89af-d11c809ebb3b',
                qty: 500
            }
            expect(row).toEqual(expected);
            done();
        })
    }
    dbHelper.removeProductInWarehouse(db,
        '38538505', 
        97, 
        next, 
        empty);
});

test("Remove invalid product and valid warehouse in stock test", done => {
    const next = () => {
        db.get(`SELECT * FROM stock WHERE SKU=? AND warehouse_num=?`,
        ["38538505-0767-453f-89af-d11c809ebb3b",
        970,],
        function(err, row){
            let expected = {
                warehouse_num: 970,
                SKU: '38538505-0767-453f-89af-d11c809ebb3b',
                qty: 500
            }
            expect(row).toEqual(expected);
            done();
        })
    }
    dbHelper.removeProductInWarehouse(db,
        '38538505', 
        970, 
        next, 
        empty);
});

test("Remove valid product and invalid warehouse in stock test", done => {
    const next = () => {
        db.get(`SELECT * FROM stock WHERE SKU=? AND warehouse_num=?`,
        ["38538505-0767-453f-89af-d11c809ebb3b",
        970,],
        function(err, row){
            let expected = {
                warehouse_num: 970,
                SKU: '38538505-0767-453f-89af-d11c809ebb3b',
                qty: 500
            }
            expect(row).toEqual(expected);
            done();
        })
    }
    dbHelper.removeProductInWarehouse(db,
        '38538505-0767-453f-89af-d11c809ebb3b', 
        97, 
        next, 
        empty);
});

test("Remove valid product and valid warehouse in stock test", done => {
    const next = () => {
        db.all(`SELECT * FROM stock WHERE SKU=? AND warehouse_num=?`,
        ["38538505-0767-453f-89af-d11c809ebb3b",
        970,],
        function(err, rows){
            expect(rows.length).toEqual(0);
            done();
        })
    }
    dbHelper.removeProductInWarehouse(db,
        '38538505-0767-453f-89af-d11c809ebb3b', 
        970, 
        next, 
        empty);
});

afterAll(() => {
    // close the databse before ending the program
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
    });
});
