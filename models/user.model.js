const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt")
const IndexError = require("../errors/index.error")

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
        picture: {
            type: String,
            default: "./uploads/profil/random-user.png",
        },
        bio: {
            type: String,
            minLength: 3,
            maxLength: 1024,
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

// Gestionnaire d'événements "pre-save"
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) {
        return next();
    }

    // Hash du password
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (error) {
        return next(error)
    }
})

// Gestionnaire d'événements "post-save"
userSchema.post("save", function(error, doc, next) {
    // Prise en charge des erreurs pour les index unique
    if (error.name === 'MongoServerError' && error.code === 11000) {
        return next(new IndexError("IndexError", { pseudo: { message: "Pseudo is already used", path: "pseudo" } }))
    }

    return next();
})

const UserModel = mongoose.model('user', userSchema)
module.exports = UserModel;