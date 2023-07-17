const mongoose = require('mongoose');
const validator = require('validator');
const postSchema = new mongoose.Schema({
    category_id: {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
        // required: true
    },
    post_type: {
        type: mongoose.Schema.ObjectId,
        ref: "PostType",
        // required: true
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
    title: {
        type: String,
        required: [true, 'Please provide a Title'],
        maxlength: [200, 'title should be not more than 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide a Description'],
    },
    // active || inactive the complete post
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    // enable/disable a single feature like comments and some other feature
    enable: {
        type: String,
        enum: ["enable", "disable"],
        default: "enable"
    },
    approve_by: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
    deleted_at: {
        type: Date,
        default: null
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema)