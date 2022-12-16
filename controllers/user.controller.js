const UserModel = require('../models/user.model')
const { isValidObjectId } = require("mongoose");

module.exports.getUsers = async (req, res) => {
    try {
        const users = await UserModel.find({}).select('-password')
        return res.json({ message: "OK", status: 200, data: users });
    } catch (err) {
        return res.status(500).json({errors: err})
    }
}

module.exports.getUser = async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({
            message: "Bad Request",
            status: 400,
            error: `Invalid ObjectID: ${req.params.id}`
        });
    }
    try {
        let user = await UserModel.findById(req.params.id).select('-password');
        return res.json({message: "OK", status: 200, data: user});
    } catch (err) {
        return res.status(500).json(err);
    }
}

module.exports.updateUser = async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({message: "Bad Request", status: 400, error: `Invalid ObjectID: ${req.params.id}`});
    }
    const { bio, pseudo, email, password} = req.body;
    const filter = { _id: req.params.id };
    const update = {
        $set: { bio },
        $setOnInsert: { pseudo, email, password }
    };
    const opts = { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }


    try {
        const doc = await UserModel.findOneAndUpdate(filter, update, opts);
        let error = doc.validateSync()
        if (error) {
            await UserModel.deleteOne(filter)
            return res.status(400).json({ message: "Bad Request", status: 400, ...error })
        }

        return res.json({ message: "OK", status: 200, data: doc })
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: "Bad Request", status: 400, ...error })
        }

        if (error.name === 'IndexError') {
            return res.status(400).json({ message: "Bad Request", status: 400, errors: error.errors });
        }

        return res.status(500).json({errors: error})
    }
}

module.exports.deleteUser = async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({
            message: "Bad Request",
            status: 400,
            error: `Invalid ObjectID: ${req.params.id}`
        });
    }

    try {
        const result = await UserModel.deleteOne({ _id: req.params.id });
        if (!result?.deletedCount) {
            return res.status(404).json({
                message: "Not Found",
                status: 404,
                description: `Failed to delete user with the given id: ${req.params.id}`
            });
        }
        return res.status(200).json({message: "OK", status: 200, description: "User deleted with success"})
    } catch (err) {
        return res.status(500).json({errors: err})
    }
}