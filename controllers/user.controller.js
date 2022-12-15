const UserModel = require('../models/user.model')
const { Types: { ObjectId: ObjectId } } = require('mongoose');

module.exports.getUsers = async (req, res) => {
    try {
        const users = await UserModel.find({}).select('-password')
        return res.json({ message: "OK", status: 200, data: users });
    } catch (err) {
        return res.status(500).json({errors: err})
    }
}

module.exports.getUser = async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) {
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
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: "Bad Request",
            status: 400,
            error: `Invalid ObjectID: ${req.params.id}`
        });
    }

    const filter = { _id: req.params.id }
    const update = {
        $set: { bio: req.body.bio},
        $setOnInsert: {pseudo: null, email: null, password: null}
    }
    const opts = { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true };

    try {
        let user = await UserModel.findOneAndUpdate(filter, update, opts)
        return res.json({ message: "OK", status: 200, data: user })
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: "Bad Request", status: 400, data: error })
        }
        return res.status(500).json({errors: error})
    }
}

module.exports.deleteUser = async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) {
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