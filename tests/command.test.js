const dbHelper = require("../dbHelper");
const command = require('../command');
const sqlite3 = require('sqlite3').verbose();

var db;
const empty = () => {};
const fakeReadline = {
    prompt: () => {},
}

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

describe("Add product tests", () => {
    let spy1;
    let spy2;
    let spy3;

    beforeAll(() => { // get rid of async
        spy1 = jest.spyOn(dbHelper, "insertProduct");
        spy2 = jest.spyOn(console, "log");
        spy3 = jest.spyOn(fakeReadline, "prompt");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Add product valid command test", () => {
        return command.addProduct(db, fakeReadline, "BED", "5ce956fa-a71e-4bfb-b6ae-5eeaa5eb0a70").then(() => {
            expect(spy1).toHaveBeenCalledTimes(1);
            expect(spy2).toHaveBeenCalledTimes(0);
            expect(spy3).toHaveBeenCalledTimes(1);
        });
    });
    
    test("Add product existing product sku test", () => {
        return command.addProduct(db, fakeReadline, "TRUNK", "5ce956fa-a71e-4bfb-b6ae-5eeaa5eb0a70").then(() => {
            expect(spy1).toHaveBeenCalledTimes(1);
            expect(spy2).toHaveBeenCalledTimes(1);
            expect(spy2).toHaveBeenLastCalledWith("ERROR ADDING PRODUCT with SKU 5ce956fa-a71e-4bfb-b6ae-5eeaa5eb0a70\nALREADY EXISTS");
            expect(spy3).toHaveBeenCalledTimes(1);
        });
    });
});

describe("Add warehouse tests", () => {
    let spy1;
    let spy2;
    let spy3;

    beforeAll(() => { // get rid of async
        spy1 = jest.spyOn(dbHelper, "insertWarehouse");
        spy2 = jest.spyOn(console, "log");
        spy3 = jest.spyOn(fakeReadline, "prompt");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Add warehouse valid command test", () => {
        return command.addWarehouse(db, fakeReadline, 970, null).then(() => {
            expect(spy1).toHaveBeenCalledTimes(1);
            expect(spy2).toHaveBeenCalledTimes(0);
            expect(spy3).toHaveBeenCalledTimes(1);
        });
    });
    
    test("Add warehouse existing warehouse num test", () => {
        return command.addWarehouse(db, fakeReadline, 970, null).then(() => {
            expect(spy1).toHaveBeenCalledTimes(1);
            expect(spy2).toHaveBeenCalledTimes(1);
            expect(spy2).toHaveBeenLastCalledWith("ERROR ADDING WAREHOUSE with WAREHOUSE# 970\nALREADY EXISTS");
            expect(spy3).toHaveBeenCalledTimes(1);
        });
    });

    test("Add warehouse invalid warehouse num argument test", () => {
        return command.addWarehouse(db, fakeReadline, "adsf", null).then(() => {
            expect(spy1).toHaveBeenCalledTimes(0);
            expect(spy2).toHaveBeenCalledTimes(1);
            // expect(spy2).toHaveBeenLastCalledWith("ERROR ADDING WAREHOUSE with WAREHOUSE# adsf \nWAREHOUSE# NOT INTEGER");
            expect(spy3).toHaveBeenCalledTimes(1);
        });
    });

    test("Add warehouse invalid limit argument test", () => {
        return command.addWarehouse(db, fakeReadline, 1, "null").then(() => {
            expect(spy1).toHaveBeenCalledTimes(0);
            expect(spy2).toHaveBeenCalledTimes(1);
            expect(spy2).toHaveBeenLastCalledWith("ERROR ADDING WAREHOUSE with STOCK_LIMIT null\nSTOCK_LIMIT NOT INTEGER");
            expect(spy3).toHaveBeenCalledTimes(1);
        });
    });
});

describe("List products tests", () => {
    let spy1;
    let spy2;
    let spy3;

    beforeAll(() => { // get rid of async
        spy1 = jest.spyOn(dbHelper, "getAllProduct");
        spy2 = jest.spyOn(console, "table");
        spy3 = jest.spyOn(fakeReadline, "prompt");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("List products valid command test", () => {
        return command.listProducts(db, fakeReadline).then(() => {
            expect(spy1).toHaveBeenCalledTimes(1);
            expect(spy2).toHaveBeenCalledTimes(1);
            expect(spy3).toHaveBeenCalledTimes(1);
        });
    });
});

describe("List warehouses tests", () => {
    let spy1;
    let spy2;
    let spy3;

    beforeAll(() => { // get rid of async
        spy1 = jest.spyOn(dbHelper, "getAllWarehouse");
        spy2 = jest.spyOn(console, "table");
        spy3 = jest.spyOn(fakeReadline, "prompt");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("List warehouses valid command test", () => {
        return command.listWarehouses(db, fakeReadline).then(() => {
            expect(spy1).toHaveBeenCalledTimes(1);
            expect(spy2).toHaveBeenCalledTimes(1);
            expect(spy3).toHaveBeenCalledTimes(1);
        });
    });
});

describe("List warehouse tests", () => {
    let spy1;
    let spy2;
    let spy3;

    beforeAll(() => { // get rid of async
        spy1 = jest.spyOn(dbHelper, "getProductsInWarehouse");
        spy2 = jest.spyOn(console, "table");
        spy3 = jest.spyOn(fakeReadline, "prompt");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("List warehouse valid command test", () => {
        return command.listWarehouse(db, fakeReadline, 970).then(() => {
            expect(spy1).toHaveBeenCalledTimes(1);
            expect(spy2).toHaveBeenCalledTimes(1);
            expect(spy3).toHaveBeenCalledTimes(1);
        });
    });
    
    test("List warehouse invalid command test", () => {
        return command.listWarehouse(db, fakeReadline, 0).then(() => {
            expect(spy1).toHaveBeenCalledTimes(1);
            expect(spy2).toHaveBeenCalledTimes(1);
            expect(spy3).toHaveBeenCalledTimes(1);
        });
    });
});

describe("Stock tests", () => {
    let spy1;
    let spy2;
    let spy3;
    let spy4;
    let spy5;
    let spy6;
    let spy7;

    beforeAll(() => { // get rid of async
        spy1 = jest.spyOn(dbHelper, "getWarehouseLimit");
        spy2 = jest.spyOn(console, "log");
        spy3 = jest.spyOn(fakeReadline, "prompt");
        spy4 = jest.spyOn(dbHelper, "getSumProductInWarehouse");
        spy5 = jest.spyOn(dbHelper, "getProductInWarehouse");
        spy6 = jest.spyOn(dbHelper, "insertProductInWarehouse");
        spy7 = jest.spyOn(dbHelper, "updateProductInWarehouse");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Stock valid command test", () => {
        return command.stock(db, fakeReadline, "5ce956fa-a71e-4bfb-b6ae-5eeaa5eb0a70", 970, 1000).then(() => {
            expect(spy1).toHaveBeenCalledTimes(1);
            expect(spy3).toHaveBeenCalledTimes(1);
            expect(spy4).toHaveBeenCalledTimes(1);
            expect(spy5).toHaveBeenCalledTimes(1);
            expect(spy6).toHaveBeenCalledTimes(1);
        });
    });
})

describe("Unstock tests", () => {
    let spy1;
    let spy2;
    let spy3;
    let spy4;
    let spy5;
    let spy6;

    beforeAll(() => { // get rid of async
        spy1 = jest.spyOn(dbHelper, "getWarehouseLimit");
        spy2 = jest.spyOn(console, "log");
        spy3 = jest.spyOn(fakeReadline, "prompt");
        spy4 = jest.spyOn(dbHelper, "getSumProductInWarehouse");
        spy5 = jest.spyOn(dbHelper, "getProductInWarehouse");
        spy6 = jest.spyOn(dbHelper, "updateProductInWarehouse");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Unstock valid command test", () => {
        return command.stock(db, fakeReadline, "5ce956fa-a71e-4bfb-b6ae-5eeaa5eb0a70", 970, 1000).then(() => {
            expect(spy1).toHaveBeenCalledTimes(1);
            expect(spy3).toHaveBeenCalledTimes(1);
            expect(spy4).toHaveBeenCalledTimes(1);
            expect(spy5).toHaveBeenCalledTimes(1);
            expect(spy6).toHaveBeenCalledTimes(1);
        });
    });
});

afterAll(() => {
    // close the databse before ending the tests
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
    });
});