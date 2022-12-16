class BaseError extends Error {
    constructor(name, errors, code, message) {
        super(message);

        this.name = name
        this.errors = errors
        this.code = code
    }
}

module.exports = BaseError