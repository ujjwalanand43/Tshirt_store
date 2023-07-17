const mongoose = require('mongoose');
const validator = require('validator');

const postMediaSchema = new mongoose.Schema({
    post_id: {
        type: mongoose.Schema.ObjectId,
        ref: "Post",
        required: true
    },
    media: [{
        id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        },
    }],
    media_url: [{
        id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        },
    }],
    type: {
        type: String,
        enum: ['image', 'image_link', 'video', 'video_link'],
        required: [true, "Media type is required"]
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    created_by: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    updated_by: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
    deleted_at: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('PostMedia', postMediaSchema)