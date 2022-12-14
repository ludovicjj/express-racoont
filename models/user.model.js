const { mongoose } = require("mongoose");
const { isEmail } = require("validator");

const userSchema = new mongoose.Schema(
    {
        pseudo: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 50,
            unique: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            validate: [isEmail],
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            maxLength: 1024,
            minLength: 6
        },
        bio: {
            type: String,
            maxLength: 1024
        },
        followers: {
            type: [String]
        },
        following: {
            type: [String]
        },
        likes: {
            type: [String]
        }
    },
    {
        timestamps: true
    }
);

const UserModel = mongoose.model('user', userSchema)
module.exports = UserModel;