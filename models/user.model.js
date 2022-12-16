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

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (error) {
        return next(error)
    }

})

userSchema.post("save", function(error, doc, next) {
    // Check if pseudo is unique (index)
    if (error.name === 'MongoServerError' && error.code === 11000) {
        return next(new IndexError("IndexError", { pseudo: { message: "Pseudo is already used", path: "pseudo" } }))
    } else {
        return next();
    }
})

userSchema.pre("findOneAndUpdate", async function (next) {
    // fetching query data into $set
    const setInsert = this.getUpdate().$setOnInsert

    // Check is password is defined
    if (!setInsert.password) {
        return next();
    }

    // Hash new password
    try {
        const salt = await bcrypt.genSalt(10);
        setInsert.password = await bcrypt.hash(setInsert.password, salt);
        return next();
    } catch (error) {
        return next(error)
    }
})

userSchema.post('findOneAndUpdate', function(error, res, next) {
    // Check if index pseudo is unique
    if (error.name === 'MongoServerError' && error.code === 11000) {
        return next(new IndexError("IndexError", { pseudo: { message: "Pseudo is already used", path: "pseudo" } }))
    }
    if (error) {
        return next(error);
    }

    return next();
});

const UserModel = mongoose.model('user', userSchema)
module.exports = UserModel;