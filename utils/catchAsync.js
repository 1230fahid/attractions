//the purpose of this file is to catch client side errors

//Added this async util just in case I want to use error handlers.
/*function catchAsync(fn) { //returns a function that returns a promise
    return function (req, res, next) {
        fn(req, res, next).catch(e => next(e)); //catch error and move it to next
    }
}

module.exports = catchAsync();*/

module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(err => next(err));
    }
}

//this equals a function, lets call func, that returns a function that executes func, and catches error to pass to next 