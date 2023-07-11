const User = require('../models/user');
const BigPromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary');
const mailHelper = require('../utils/emailHelper');
const crypto = require('crypto');

exports.signup = BigPromise(async(req, res, next) => {
    if (!req.files) {
        return next(new CustomError("Photo is required for signup", 400));
    };

    const { name, email, password } = req.body;

    if (!email || !name || !password) {
        return next(new CustomError('Name , email and password are required', 400));
    }

    let file = req.files.photo
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
        folder: process.env.CLOUDINARY_FOLDER_FOR_USER,
        width: 150,
        crop: "scale"
    });


    const user = await User.create({
        name,
        email,
        password,
        photo: {
            id: result.public_id,
            secure_url: result.secure_url
        }
    });

    cookieToken(user, res);
});

exports.login = BigPromise(async(req, res, next) => {
    const { email, password } = req.body;

    // check for presence of email and password
    if (!email || !password) {
        return next(new CustomError('Please provide email and password', 400))
    }

    // Get user from db
    const user = await User.findOne({ email }).select("+password");

    // if user not found in db
    if (!user) {
        return next(new CustomError("Email or Password doesn't exist", 400));
    }

    //  match the password
    const isPasswordCorrect = await user.isValidatedPassword(password);

    // if password do not match
    if (!isPasswordCorrect) {
        return next(new CustomError("Email or Password doesn't exist", 400));
    }
    // Everything ok ?? send the token
    cookieToken(user, res);
});

exports.logout = BigPromise(async(req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });
    res.status(200).json({
        sucess: true,
        message: "Logout Success"
    });
});

exports.forgotPassword = BigPromise(async(req, res, next) => {
    // collect email
    const { email } = req.body;

    // find user in database
    const user = await User.findOne({ email });

    // if user not found in database
    if (!user) {
        return next(new CustomError('Email not found', 400))
    }

    // get token from user model methods
    const forgotToken = user.getForgotPasswordToken();

    // save user fields in DB
    await user.save({
        validateBeforeSave: false
    });

    // create a URL
    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`;

    // Crafting a message
    const message = `Copy paste this link in your URl and hit enter \n\n ${myUrl}`;

    // attempt to send email
    try {
        await mailHelper({
            email: user.email,
            subject: "AU Tshirt Store Password reset email",
            message
        });

        // json response if email is success
        res.status(200).json({
            sucess: true,
            message: "Email send successfully !"
        })
    } catch (error) {
        // reset user fields if things goes wrong
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        await user.save({
            validateBeforeSave: false
        });
        return next(new CustomError(error.message, 500));
    }
});

exports.passwordReset = BigPromise(async(req, res, next) => {
    const token = req.params.token;
    const encryToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
    console.log(encryToken)
    const user = await User.findOne({
        forgotPasswordToken: encryToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    });

    console.log(user)
    if (!user) {
        return next(new CustomError('Token is invalid or expired', 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new CustomError('Password and Confirm Password does not match', 400))
    }

    user.password = req.body.password
    console.log('hello')
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    // send a json response or send token
    cookieToken(user, res);
});

exports.getLoggedInUserDetails = BigPromise(async(req, res, next) => {
    // req.user will be added by middleware
    // find user by id
    const user = await User.findById(req.user.id);
    res.status(200).json({
        sucess: true,
        user
    })
});

exports.changePassword = BigPromise(async(req, res, next) => {
    const userId = req.user.id;
    const user = await User.findById(userId).select("+password");
    console.log(user)
    const isCorrectOldPassword = await user.isValidatedPassword(req.body.oldPassword);

    if (!isCorrectOldPassword) {
        return next(new CustomError('Old Password is incorrect', 400));
    }

    user.password = req.body.password;

    await user.save();

    cookieToken(user, res)
});

exports.updateUserDetails = BigPromise(async(req, res, next) => {
    if (req.body.name === '' || req.body.email === '') {
        return next(new CustomError('Email And Name is required', 400))
    }
    const newdata = {
        name: req.body.name,
        email: req.body.email
    };

    if (req.files) {
        const user = await User.findById(req.user.id);

        const imageId = user.photo.id;

        // delete existing photo on cloudinary
        const response = await cloudinary.v2.uploader.destroy(imageId);

        // Upload the new photo
        const result = await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath, {
            folder: process.env.CLOUDINARY_FOLDER_FOR_USER,
            width: 150,
            crop: "scale"
        });

        newdata.photo = {
            id: result.public_id,
            secure_url: result.secure_url
        };
    }

    const user = await User.findByIdAndUpdate(req.user.id, newdata, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        user
    });
});

exports.adminAllUser = BigPromise(async(req, res, next) => {
    const users = await User.find({});

    res.status(200).json({
        success: true,
        users,
    })
});
exports.adminSingleUser = BigPromise(async(req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new CustomError("No user found", 400));
    };

    res.status(200).json({
        success: true,
        user
    });
});

exports.adminUpdateSingleUserDetails = BigPromise(async(req, res, next) => {
    if (req.body.name === '' || req.body.email === '') {
        return next(new CustomError('Email And Name is required', 400))
    }
    const newdata = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    };

    const user = await User.findByIdAndUpdate(req.params.id, newdata, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        user
    });
});
exports.adminDeleteSingleUserDetails = BigPromise(async(req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new CustomError('No Such user found', 401));
    }
    const imageId = user.photo.id;
    await cloudinary.v2.uploader.destroy(imageId);
    console.log(user)
    await user.remove({}, function(err) {
        if (err) {
            return next(new CustomError('Some error occured', 401))
        } else {
            res.status(200).json({
                success: true,
                message: "User Deleted Successfully"
            });
        }
    });


});

// Just for testing
exports.managerAllUser = BigPromise(async(req, res, next) => {
    const users = await User.find({ role: "user" });

    res.status(200).json({
        success: true,
        users,
    })
});