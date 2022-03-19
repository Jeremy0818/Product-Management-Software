const dbHelper = require("../dbHelper");
const command = require('../command');
const sqlite3 = require('sqlite3').verbose();

var db;
const empty = () => {};
const fail = (err) => { console.error(err.message) };
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

test("Add product valid command test", done => {
    command.addProduct(db, fakeReadline, sku, productName);
    done();
    
});

test("Add product invalid command test", done => {
    command.addProduct(db, fakeReadline, sku, productName);
    done();
});

test("Add warehouse valid command test", done => {
    done();
});

test("Add warehouse invalid command test", done => {
    done();
});

test("List products valid command test", done => {
    expect(console.table).toHaveBeenCalledWith();
    done();
});

test("List products invalid command test", done => {
    expect(console.table).toHaveBeenCalledWith();
    done();
});

test("List warehouses valid command test", done => {
    expect(console.table).toHaveBeenCalledWith();
    done();
});

test("List warehouses invalid command test", done => {
    expect(console.table).toHaveBeenCalledWith();
    done();
});

test("List warehouse valid command test", done => {
    expect(console.table).toHaveBeenCalledWith();
    done();
});

test("List warehouse invalid command test", done => {
    expect(console.table).toHaveBeenCalledWith();
    done();
});

test("Stock valid command test", done => {
    done();
});

test("Stock invalid command test", done => {
    done();
});

test("Unstock valid command test", done => {
    done();
});

test("Unstock invalid command test", done => {
    done();
});

afterAll(() => {
    // close the databse before ending the tests
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
    });
});