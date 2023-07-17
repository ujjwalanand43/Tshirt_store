const PostMedia = require('../models/postMedia');
const BigPromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');

const cloudinary = require('cloudinary');
const mailHelper = require('../utils/emailHelper');

exports.addMedia = BigPromise(async(req, res, next) => {
    req.body.created_by = req.user.id;

    // if (!req.body.post_id || !req.body.created_by || !req.body.media || !req.body.media_url || !req.body.type) {
    //     return next(new CustomError("Post_id, Created_by , Media, Media_url,type is required", 400));
    // };

    let imagesArray = [];

    if (req.body.type === "image" && req.files.media) {
        console.log("hello");

        if (Array.isArray(req.files.media)) {
            // Handle the case where req.files.media is an array
            for (let index = 0; index < req.files.media.length; index++) {
                console.log("UPLOAD START...");
                let result = await cloudinary.v2.uploader.upload(req.files.media[index].tempFilePath, {
                    folder: "blog_users/post",
                });
                console.log("RESULT", result.secure_url);
                imagesArray.push({
                    id: result.public_id,
                    secure_url: result.secure_url,
                });
            }
        } else {
            // Handle the case where req.files.media is a single element (not an array)
            console.log("UPLOAD START...");
            let result = await cloudinary.v2.uploader.upload(req.files.media.tempFilePath, {
                folder: "blog_users/post",
            });
            console.log("RESULT", result.secure_url);
            imagesArray.push({
                id: result.public_id,
                secure_url: result.secure_url,
            });
        }
    };

    req.body.media = imagesArray;

    let image_link = [];

    const allMediaUrl = await req.body.media_url.split(",")
        // console.log(allMediaUrl)
    let mediaArr = allMediaUrl.map((single_media_url) => {
        return { single_media_url }
    })

    if (req.body.type === "image_link" && req.body.media_url) {

        if (Array.isArray(mediaArr)) {
            // Handle the case where req.body.media_url is an array
            for (let index = 0; index < mediaArr.length; index++) {

                console.log("UPLOAD START...");
                let result = await cloudinary.v2.uploader.upload(mediaArr[index].single_media_url, {
                    folder: "blog_users/post",
                });
                console.log("RESULT", result);
                image_link.push({
                    id: result.public_id,
                    secure_url: result.secure_url,
                });
            }
        } else {
            // Handle the case where req.body.media_url is a single element (not an array)

            console.log("UPLOAD START...");
            let result = await cloudinary.v2.uploader.upload(req.body.media_url, {
                folder: "blog_users/post",
            });
            console.log("RESULT", result);
            image_link.push({
                id: result.public_id,
                secure_url: result.secure_url,
            });
        }
    }

    req.body.media_url = image_link;

    const postMedia = await PostMedia.create(req.body);

    res.status(201).json({
        success: true,
        postMedia
    });

});

exports.getAllData = BigPromise(async(req, res, next) => {
    const Media = await PostMedia.find({})
        .populate('post_id')
        .populate('created_by')
    res.status(200).json({
        success: true,
        Media,
    });
});

exports.getSingleMedia = BigPromise(async(req, res, next) => {
    const singleMedia = await PostMedia.findById(req.params.id)
        .populate('post_id')
        .populate('created_by')

    if (!singleMedia) {
        return next(new CustomError("No user found", 400))
    }
    res.status(200).json({
        success: true,
        singleMedia
    });
});