const DbHelper = require("../dbHelper");
const Command = require('../command');
const sqlite3 = require('sqlite3').verbose();

var db, dbHelper, command;
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
                dbHelper = new DbHelper(db);
                command = new Command(dbHelper, fakeReadline);
                dbHelper.setuptable(resolve, empty);
            }
        );
    })
};

beforeAll(async () => {
    // wait for the database to setup the tables
    await setup();
});

describe("Add product tests", () => {
    let spyInsert;
    let spyLog;
    let spyPrompt;

    beforeAll(() => {
        spyInsert = jest.spyOn(dbHelper, "insertProduct");
        spyLog = jest.spyOn(console, "log");
        spyPrompt = jest.spyOn(fakeReadline, "prompt");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Add product valid command test", () => {
        return command.addProduct("BED", "5ce956fa-a71e-4bfb-b6ae-5eeaa5eb0a70").then(() => {
            expect(spyInsert).toHaveBeenCalledTimes(1);
            expect(spyLog).toHaveBeenCalledTimes(0);
            expect(spyPrompt).toHaveBeenCalledTimes(1);
        });
    });
    
    test("Add product existing product sku test", () => {
        return command.addProduct("TRUNK", "5ce956fa-a71e-4bfb-b6ae-5eeaa5eb0a70").then(() => {
            expect(spyInsert).toHaveBeenCalledTimes(1);
            expect(spyLog).toHaveBeenCalledTimes(1);
            expect(spyLog).toHaveBeenLastCalledWith("ERROR ADDING PRODUCT with SKU 5ce956fa-a71e-4bfb-b6ae-5eeaa5eb0a70\nALREADY EXISTS");
            expect(spyPrompt).toHaveBeenCalledTimes(1);
        });
    });
});

describe("Add warehouse tests", () => {
    let spyInsert;
    let spyLog;
    let spyPrompt;

    beforeAll(() => {
        spyInsert = jest.spyOn(dbHelper, "insertWarehouse");
        spyLog = jest.spyOn(console, "log");
        spyPrompt = jest.spyOn(fakeReadline, "prompt");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Add warehouse valid command test", () => {
        return command.addWarehouse(970, null).then(() => {
            expect(spyInsert).toHaveBeenCalledTimes(1);
            expect(spyLog).toHaveBeenCalledTimes(0);
            expect(spyPrompt).toHaveBeenCalledTimes(1);
        });
    });
    
    test("Add warehouse existing warehouse num test", () => {
        return command.addWarehouse(970, null).then(() => {
            expect(spyInsert).toHaveBeenCalledTimes(1);
            expect(spyLog).toHaveBeenCalledTimes(1);
            expect(spyLog).toHaveBeenLastCalledWith("ERROR ADDING WAREHOUSE with WAREHOUSE# 970\nALREADY EXISTS");
            expect(spyPrompt).toHaveBeenCalledTimes(1);
        });
    });

    test("Add warehouse invalid warehouse num argument test", () => {
        return command.addWarehouse("adsf", null).then(() => {
            expect(spyInsert).toHaveBeenCalledTimes(0);
            expect(spyLog).toHaveBeenCalledTimes(1);
            expect(spyLog).toHaveBeenLastCalledWith("ERROR ADDING WAREHOUSE with WAREHOUSE# adsf\nWAREHOUSE# NOT INTEGER");
            expect(spyPrompt).toHaveBeenCalledTimes(1);
        });
    });

    test("Add warehouse invalid limit argument test", () => {
        return command.addWarehouse(1, "null").then(() => {
            expect(spyInsert).toHaveBeenCalledTimes(0);
            expect(spyLog).toHaveBeenCalledTimes(1);
            expect(spyLog).toHaveBeenLastCalledWith("ERROR ADDING WAREHOUSE with STOCK_LIMIT null\nSTOCK_LIMIT NOT INTEGER");
            expect(spyPrompt).toHaveBeenCalledTimes(1);
        });
    });
});

describe("List products tests", () => {
    let spyGet;
    let spyTable;
    let spyPrompt;

    beforeAll(() => {
        spyGet = jest.spyOn(dbHelper, "getAllProduct");
        spyTable = jest.spyOn(console, "table");
        spyPrompt = jest.spyOn(fakeReadline, "prompt");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("List products valid command test", () => {
        return command.listProducts().then(() => {
            expect(spyGet).toHaveBeenCalledTimes(1);
            expect(spyTable).toHaveBeenCalledTimes(1);
            expect(spyTable).toHaveBeenLastCalledWith([
                {
                  ITEM_NAME: 'BED',
                  ITEM_SKU: '5ce956fa-a71e-4bfb-b6ae-5eeaa5eb0a70'
                }
              ]);
            expect(spyPrompt).toHaveBeenCalledTimes(1);
        });
    });
});

describe("List warehouses tests", () => {
    let spyGet;
    let spyTable;
    let spyPrompt;

    beforeAll(() => {
        spyGet = jest.spyOn(dbHelper, "getAllWarehouse");
        spyTable = jest.spyOn(console, "table");
        spyPrompt = jest.spyOn(fakeReadline, "prompt");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("List warehouses valid command test", () => {
        return command.listWarehouses().then(() => {
            expect(spyGet).toHaveBeenCalledTimes(1);
            expect(spyTable).toHaveBeenCalledTimes(1);
            expect(spyTable).toHaveBeenLastCalledWith([ { WAREHOUSE: 970 } ]);
            expect(spyPrompt).toHaveBeenCalledTimes(1);
        });
    });
});

describe("List warehouse tests", () => {
    let spyGetProduct;
    let spyTable;
    let spyPrompt;
    let spyLog;
    let spyGetLimit;

    beforeAll(() => {
        spyGetProduct = jest.spyOn(dbHelper, "getProductsInWarehouse");
        spyTable = jest.spyOn(console, "table");
        spyPrompt = jest.spyOn(fakeReadline, "prompt");
        spyLog = jest.spyOn(console, "log");
        spyGetLimit = jest.spyOn(dbHelper, "getWarehouseLimit");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("List warehouse valid command test", () => {
        return command.listWarehouse(970).then(() => {
            expect(spyGetProduct).toHaveBeenCalledTimes(1);
            expect(spyTable).toHaveBeenCalledTimes(1);
            expect(spyTable).toHaveBeenLastCalledWith([]);
            expect(spyPrompt).toHaveBeenCalledTimes(1);
            expect(spyGetLimit).toHaveBeenCalledTimes(1);
        });
    });
    
    test("List non-existing warehouse test", () => {
        return command.listWarehouse(0).then(() => {
            expect(spyGetProduct).toHaveBeenCalledTimes(0);
            expect(spyTable).toHaveBeenCalledTimes(0);
            expect(spyPrompt).toHaveBeenCalledTimes(1);
            expect(spyLog).toHaveBeenCalledTimes(1);
            expect(spyLog).toHaveBeenLastCalledWith("ERROR LISTING WAREHOUSE with WAREHOUSE# 0\nWAREHOUSE DOES NOT EXIST");
            expect(spyGetLimit).toHaveBeenCalledTimes(1);
        });
    });

    test("List invalid warehouse argument test", () => {
        return command.listWarehouse("asdf").then(() => {
            expect(spyGetProduct).toHaveBeenCalledTimes(0);
            expect(spyTable).toHaveBeenCalledTimes(0);
            expect(spyPrompt).toHaveBeenCalledTimes(1);
            expect(spyLog).toHaveBeenCalledTimes(1);
            expect(spyLog).toHaveBeenLastCalledWith("ERROR LISTING WAREHOUSE with WAREHOUSE# asdf\nWAREHOUSE# NOT INTEGER");
            expect(spyGetLimit).toHaveBeenCalledTimes(0);
        });
    });
});

describe("Stock tests", () => {
    let spyGetLimit;
    let spyLog;
    let spyPrompt;
    let spyGetProduct;
    let spyGetSum;
    let spyInsert;
    let spyUpdate;

    beforeAll(() => {
        spyGetLimit = jest.spyOn(dbHelper, "getWarehouseLimit");
        spyLog = jest.spyOn(console, "log");
        spyPrompt = jest.spyOn(fakeReadline, "prompt");
        spyGetSum = jest.spyOn(dbHelper, "getSumProductInWarehouse");
        spyGetProduct = jest.spyOn(dbHelper, "getProductInWarehouse");
        spyInsert = jest.spyOn(dbHelper, "insertProductInWarehouse");
        spyUpdate = jest.spyOn(dbHelper, "updateProductInWarehouse");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Stock valid command test", () => {
        return command.stock("5ce956fa-a71e-4bfb-b6ae-5eeaa5eb0a70", 970, 1000).then(() => {
            expect(spyGetLimit).toHaveBeenCalledTimes(1);
            expect(spyPrompt).toHaveBeenCalledTimes(1);
            expect(spyGetSum).toHaveBeenCalledTimes(1);
            expect(spyGetProduct).toHaveBeenCalledTimes(1);
            expect(spyInsert).toHaveBeenCalledTimes(1);
            expect(spyUpdate).toHaveBeenCalledTimes(0);
            expect(spyLog).toHaveBeenCalledTimes(0);
        });
    });

    test("Stock existing product valid command test", () => {
        return command.stock("5ce956fa-a71e-4bfb-b6ae-5eeaa5eb0a70", 970, 1000).then(() => {
            expect(spyGetLimit).toHaveBeenCalledTimes(1);
            expect(spyPrompt).toHaveBeenCalledTimes(1);
            expect(spyGetProduct).toHaveBeenCalledTimes(1);
            expect(spyInsert).toHaveBeenCalledTimes(0);
            expect(spyGetSum).toHaveBeenCalledTimes(1);
            expect(spyUpdate).toHaveBeenCalledTimes(1);
            expect(spyLog).toHaveBeenCalledTimes(0);
        });
    });

    test("Stock invalid product sku test", () => {
        return command.stock("5ce956fa", 970, 1000).then(() => {
            expect(spyGetLimit).toHaveBeenCalledTimes(1);
            expect(spyPrompt).toHaveBeenCalledTimes(1);
            expect(spyGetSum).toHaveBeenCalledTimes(1);
            expect(spyGetProduct).toHaveBeenCalledTimes(1);
            expect(spyInsert).toHaveBeenCalledTimes(1);
            expect(spyUpdate).toHaveBeenCalledTimes(0);
            expect(spyLog).toHaveBeenCalledTimes(1);
            expect(spyLog).toHaveBeenLastCalledWith("ERROR STOCKING WAREHOUSE with SKU 5ce956fa\nPRODUCT DOES NOT EXIST");
        });
    });

    test("Stock invalid warehouse num argument test", () => {
        return command.stock("5ce956fa", 0, 1000).then(() => {
            expect(spyGetLimit).toHaveBeenCalledTimes(1);
            expect(spyPrompt).toHaveBeenCalledTimes(1);
            expect(spyGetSum).toHaveBeenCalledTimes(0);
            expect(spyGetProduct).toHaveBeenCalledTimes(0);
            expect(spyInsert).toHaveBeenCalledTimes(0);
            expect(spyUpdate).toHaveBeenCalledTimes(0);
            expect(spyLog).toHaveBeenCalledTimes(1);
            expect(spyLog).toHaveBeenLastCalledWith("ERROR STOCKING WAREHOUSE with WAREHOUSE# 0\nWAREHOUSE DOES NOT EXIST");
        });
    });

    test("Stock invalid warehouse num argument test", () => {
        return command.stock("5ce956fa", "adsf", 1000).then(() => {
            expect(spyGetLimit).toHaveBeenCalledTimes(0);
            expect(spyPrompt).toHaveBeenCalledTimes(1);
            expect(spyGetSum).toHaveBeenCalledTimes(0);
            expect(spyGetProduct).toHaveBeenCalledTimes(0);
            expect(spyInsert).toHaveBeenCalledTimes(0);
            expect(spyUpdate).toHaveBeenCalledTimes(0);
            expect(spyLog).toHaveBeenCalledTimes(1);
            expect(spyLog).toHaveBeenLastCalledWith("ERROR STOCKING WAREHOUSE with WAREHOUSE# adsf\nWAREHOUSE# NOT INTEGER");
        });
    });

    test("Stock invalid quantity argument test", () => {
        return command.stock("5ce956fa", 970, "adsf").then(() => {
            expect(spyGetLimit).toHaveBeenCalledTimes(0);
            expect(spyPrompt).toHaveBeenCalledTimes(1);
            expect(spyGetSum).toHaveBeenCalledTimes(0);
            expect(spyGetProduct).toHaveBeenCalledTimes(0);
            expect(spyInsert).toHaveBeenCalledTimes(0);
            expect(spyUpdate).toHaveBeenCalledTimes(0);
            expect(spyLog).toHaveBeenCalledTimes(1);
            expect(spyLog).toHaveBeenLastCalledWith("ERROR STOCKING WAREHOUSE with QTY adsf\nQTY NOT INTEGER");
        });
    });
})

describe("Unstock tests", () => {
    let spyGetLimit;
    let spyLog;
    let spyPrompt;
    let spyGetProduct;
    let spyGetSum;
    let spyUpdate;

    beforeAll(() => {
        spyGetLimit = jest.spyOn(dbHelper, "getWarehouseLimit");
        spyLog = jest.spyOn(console, "log");
        spyPrompt = jest.spyOn(fakeReadline, "prompt");
        spyGetSum = jest.spyOn(dbHelper, "getSumProductInWarehouse");
        spyGetProduct = jest.spyOn(dbHelper, "getProductInWarehouse");
        spyUpdate = jest.spyOn(dbHelper, "updateProductInWarehouse");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Unstock valid command test", () => {
        return command.unstock("5ce956fa-a71e-4bfb-b6ae-5eeaa5eb0a70", 970, 1000).then(() => {
            expect(spyGetLimit).toHaveBeenCalledTimes(1);
            expect(spyPrompt).toHaveBeenCalledTimes(1);
            expect(spyGetProduct).toHaveBeenCalledTimes(1);
            expect(spyGetSum).toHaveBeenCalledTimes(1);
            expect(spyUpdate).toHaveBeenCalledTimes(1);
            expect(spyLog).toHaveBeenCalledTimes(0);
        });
    });

    test("Unstock invalid product sku test", () => {
        return command.unstock("5ce956fa", 970, 1000).then(() => {
            expect(spyGetLimit).toHaveBeenCalledTimes(1);
            expect(spyPrompt).toHaveBeenCalledTimes(1);
            expect(spyGetSum).toHaveBeenCalledTimes(1);
            expect(spyGetProduct).toHaveBeenCalledTimes(1);
            expect(spyUpdate).toHaveBeenCalledTimes(0);
            expect(spyLog).toHaveBeenCalledTimes(1);
            expect(spyLog).toHaveBeenLastCalledWith("ERROR UNSTOCKING WAREHOUSE with SKU 5ce956fa\nPRODUCT DOES NOT EXIST");
        });
    });

    test("Unstock invalid warehouse num argument test", () => {
        return command.unstock("5ce956fa", 0, 1000).then(() => {
            expect(spyGetLimit).toHaveBeenCalledTimes(1);
            expect(spyPrompt).toHaveBeenCalledTimes(1);
            expect(spyGetSum).toHaveBeenCalledTimes(0);
            expect(spyGetProduct).toHaveBeenCalledTimes(0);
            expect(spyUpdate).toHaveBeenCalledTimes(0);
            expect(spyLog).toHaveBeenCalledTimes(1);
            expect(spyLog).toHaveBeenLastCalledWith("ERROR UNSTOCKING WAREHOUSE with WAREHOUSE# 0\nWAREHOUSE DOES NOT EXIST");
        });
    });

    test("Unstock invalid warehouse num argument test", () => {
        return command.unstock("5ce956fa", "adsf", 1000).then(() => {
            expect(spyGetLimit).toHaveBeenCalledTimes(0);
            expect(spyPrompt).toHaveBeenCalledTimes(1);
            expect(spyGetSum).toHaveBeenCalledTimes(0);
            expect(spyGetProduct).toHaveBeenCalledTimes(0);
            expect(spyUpdate).toHaveBeenCalledTimes(0);
            expect(spyLog).toHaveBeenCalledTimes(1);
            expect(spyLog).toHaveBeenLastCalledWith("ERROR UNSTOCKING WAREHOUSE with WAREHOUSE# adsf\nWAREHOUSE# NOT INTEGER");
        });
    });

    test("Unstock invalid quantity argument test", () => {
        return command.unstock("5ce956fa", 970, "adsf").then(() => {
            expect(spyGetLimit).toHaveBeenCalledTimes(0);
            expect(spyPrompt).toHaveBeenCalledTimes(1);
            expect(spyGetSum).toHaveBeenCalledTimes(0);
            expect(spyGetProduct).toHaveBeenCalledTimes(0);
            expect(spyUpdate).toHaveBeenCalledTimes(0);
            expect(spyLog).toHaveBeenCalledTimes(1);
            expect(spyLog).toHaveBeenLastCalledWith("ERROR UNSTOCKING WAREHOUSE with QTY adsf\nQTY NOT INTEGER");
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