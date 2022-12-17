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

    try {
        // Récupérer le document existant ou créer un nouveau document
        let doc = await UserModel.findById(req.params.id).select('-password');
        if (!doc) {
            doc = new UserModel({pseudo, email, password});
        }

        // Mettre à jour la propriété "bio" du document
        doc.bio = bio;

        // Enregistrer le document
        await doc.save();

        return res.json({ message: "OK", status: 200, data: doc });
    } catch (error) {
        if (error.name === "ValidationError")
            return res.status(400).json({ message: "Bad Request", status: 400, ...error })

        if (error.name === 'IndexError')
            return res.status(400).json({ message: "Bad Request", status: 400, errors: error.errors });

        return res.status(500).json({errors: error})
    }
}

module.exports.deleteUser = async (req, res) => {
    const { id } = req.params

    if (!isValidObjectId(id)) {
        return res.status(400).json({message: "Bad Request", status: 400, error: "Invalid ObjectID"});
    }

    try {
        // Supprimer l'utilisateur
        const doc = await UserModel.findByIdAndDelete(id).select('-password');
        if (!doc) {
            return res.status(404).json({message: "Not Found", status: 404, description: `Failed to delete user with the given id: ${ id }`});
        }

        // Mettre à jour les utilisateurs qui suivaient ou que suivait l'utilisateur à supprimer
        if (doc.followings.length || doc.followers.length) {
            await UserModel.updateMany(
                { $or: [{followings: id}, {followers: id}] },
                { $pull: { followings: id, followers: id }}
            )
        }

        return res.status(200).json({ message: "OK", status: 200, data: { _id: doc._id } })
    } catch (err) {
        return res.status(500).json({errors: err})
    }
}

module.exports.follow = async (req, res) => {
    const { id: followerId } = req.params;
    const { idToFollow: followingId } = req.body;

    if (
        !isValidObjectId(followerId) ||
        !isValidObjectId(followingId)
    ) {
        return res.status(400).json({message: "Bad Request", status: 400, error: "Invalid ObjectID"});
    }

    try {
        // Récupérer les documents
        // followerUser : correspond à utilisateur qui suit
        // followingUser : correspond à utilisateur suivi
        let followerUser = await UserModel.findById(followerId).select('-password');
        const followingUser = await UserModel.findById(followingId);

        if (!followerUser || !followingUser)
            return res.status(400).json({message: "Bad Request", status: 400, description: "The follow operation failed"})

        if (
            !followingUser.followers.includes(followerId) &&
            followerId !== followingId
        ) {
            // Mettre à jour le document de l'utilisateur qui suit
            followerUser = await UserModel.findByIdAndUpdate(followerId, {
                $push: { followings: followingId },
            }, {new: true}).select("-password");

            // Mettre à jour le document de l'utilisateur suivi
            await UserModel.findByIdAndUpdate(followingId, {
                $push: { followers: followerId },
            });
        }

        return res.json({message: "OK", status: 200, data: followerUser})
    } catch (error) {
        return res.status(500).json({errors: error})
    }
}

module.exports.unfollow = async (req, res) => {
    const { id: followerId } = req.params;
    const { idToUnfollow: followingId } = req.body;
    if (
        !isValidObjectId(followerId) ||
        !isValidObjectId(followingId)
    ) {
        return res.status(400).json({message: "Bad Request", status: 400, error: "Invalid ObjectID"});
    }

    try {
        // Récupérer les documents
        // followerUser : correspond à utilisateur qui suit
        // followingUser : correspond à utilisateur suivi
        let followerUser = await UserModel.findById(followerId).select('-password');
        const followingUser = await UserModel.findById(followingId);

        if (!followerUser || !followingUser)
            return res.status(400).json({message: "Bad Request", status: 400, description: "The unfollow operation failed"})


        if (
            followingUser.followers.includes(followerId) &&
            followerId !== followingId
        ) {
            // Mettre à jour le document de l'utilisateur qui suit
            followerUser = await UserModel.findByIdAndUpdate(followerId, {
                $pull: { followings: followingId },
            }, {new: true}).select("-password");

            // Mettre à jour le document de l'utilisateur suivi
            await UserModel.findByIdAndUpdate(followingId, {
                $pull: { followers: followerId },
            });
        }
        return res.json({message: "OK", status: 200, data: followerUser})

    } catch (error) {
        return res.status(500).json({errors: error})
    }
}