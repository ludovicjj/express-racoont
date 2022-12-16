const BaseError = require('./base.error')

class IndexError extends BaseError {
    constructor(name, errors) {
        super(name, errors, 400, "Bad Request");
    }
}

module.exports = IndexError;