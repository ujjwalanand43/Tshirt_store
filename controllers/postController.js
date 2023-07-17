const Post = require('../models/post');
const BigPromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');

const cloudinary = require('cloudinary');
const mailHelper = require('../utils/emailHelper');

exports.addPost = BigPromise(async(req, res, next) => {
    req.body.created_by = req.user.id
    if (!req.body.title || !req.body.description || req.body.created_by) {
        return next(new CustomError("Title, Description is required", 400));
    };


    const post = await Post.create(req.body)

    res.status(200).json({
        success: true,
        post
    });
});

exports.getAllPost = BigPromise(async(req, res, next) => {
    const Posts = await Post.find({})
        .populate('created_by')
    res.status(200).json({
        success: true,
        Posts,
    });
});

exports.getSinglePost = BigPromise(async(req, res, next) => {
    const singlePost = await Post.findById(req.params.id)
        .populate('created_by')
        .populate('updated_by')

    if (!singlePost) {
        return next(new CustomError("No post found", 400))
    }
    res.status(200).json({
        success: true,
        singlePost
    });
});

exports.updateSinglePost = BigPromise(async(req, res, next) => {
    let post = await Post.findById(req.params.id);
    const requiredFields = [
        req.body.category_id,
        req.body.post_type,
        req.body.title,
        req.body.description,
        req.body.status,
        req.body.enable,
        req.body.linkedln,
        req.body.city
    ];

    requiredFields.map((singleField) => {
        console.log(singleField)
        if (singleField === '') {
            const errorMessage = `Field Cannot have empty value}`;
            return next(new CustomError(errorMessage, 400));
        }
    });

    req.body.updated_by = req.user.id;

    post = await Post.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        post,
    });

});

exports.deleteSinglePost = BigPromise(async(req, res, next) => {
    const singlePost = await Post.findByIdAndDelete(req.params.id)

    if (!singlePost) {
        return next(new CustomError("No post found with this id", 401));
    }

    res.status(200).json({
        success: "true",
        message: "Post deleted successfully !",
    });

});