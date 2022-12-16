const UserModel = require('../models/user.model')

module.exports.signUp = async (req, res) => {
    const {pseudo, email, password} = req.body;
    try {
        const user = await UserModel.create({pseudo, email, password});
        return res.status(201).json({user: user.id})
    } catch (error) {
        if (error.name === 'IndexError') {
            return res.status(400).json({ message: "Bad Request", status: 400, errors: error.errors });
        }

        return res.status(400).json({message: "Bad Request", status: 400, error: error})
    }
}