const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [40, 'FirstName should be user 40 characters']
    },
    lastname: {
        type: String,
        maxlength: [40, 'LastName should be user 40 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide a email'],
        validate: [validator.isEmail, ' Please enter email in correct format'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'password should be atleast 6 char'],
        select: false
    },
    city: {
        type: String,
        minlength: [3, 'city should be atleast 6 char'],
    },
    phone: {
        type: String,
        // match: /^(\()?\d{3}(\))?(-|\s)?\d{3}(-|\s)\d{4}$/,
        minlength: [10, 'phone should be atleast 10 char'],
    },
    country: {
        type: String,
        minlength: [3, 'password should be atleast 6 char'],
    },
    photo: {
        id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        },

    },
    cover_image: {
        id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        },

    },
    role: {
        type: String,
        default: 'user'
    },
    linkedln: {
        type: String
    },
    enable: {
        type: String,
        enum: ["enabled", "disabled"],
        default: "enabled"
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: String,
    createdAt: {
        type: Date,
        default: Date.now()
    }
});


// encrypt password before save --HOOKS
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10);
})

// Validate the password with passed on user password
userSchema.methods.isValidatedPassword = async function(usersendPassword) {
    return await bcrypt.compare(usersendPassword, this.password)
}

// create and return jwt token
userSchema.methods.getJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY
    })
}

// generate forgot password token (string)
userSchema.methods.getForgotPasswordToken = function() {
    // generate a long and random string
    const forgotToken = crypto.randomBytes(20).toString('hex');
    // getting a hash- make sure to get a hash on backend
    this.forgotPasswordToken = crypto.createHash('sha256').update(forgotToken).digest('hex');

    // time of token
    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;

    return forgotToken;
}

module.exports = mongoose.model('User', userSchema);