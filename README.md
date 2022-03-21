# Product Management Software

This is a simple program that is implemented using node js. The main program is a command line REPL that is designed to manage product inventory. The data inserted by the user will be stored in a database. Database is used in this program so that it has potential improvement in the future. For example, data is stored in non-volatile memory and can be restored easily without redundancy, allow multiple-user access to the data, increase flexibility, and so on.

## Setup and Installation

Make sure node is installed:
```
node -v
```

Make sure NPM is installed: 
```
npm -v
```

Install all the dependencies required in the program:
```
npm install
```

## How to run the program

Run the command:
```
npm start
```

## How to end the program

EOF to quit (press Ctrl + D will cause the stdin file descriptor to return end-of-file)

## How to test the program
More tests can be added to the tests folder. There are currenlty two test files for Unit testing and API testing.
```
npm test                        // to run all tests
npm test <tests/testfile>       // to test a single test suite
npm test -- --coverage          // to generate coverage report
```

## Documentation
Go to [wiki](https://github.com/Jeremy0818/Product-Management-Software/wiki) for documentation

## Extra feature
- allow upper and lower case command
- output format in table
- invalid command/argument info
- store items from previous run in database (eg. product.db)

## Future Improvement
- Generate unique id (SKU) automatically
- Enhance command and arguments handling with some help commands
- Implement user account to register and login for authentication and authorization
- Update limit of warehouse
- Improve database query failuer error message
- Print the result with a better representation (currently using console.table)
- Handle unexpected error and keep the program running
- Add more helpful commands to manage the products
