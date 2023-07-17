const mongoose = require('mongoose');
const validator = require('validator');

const postTypeSchema = new mongoose.Schema({

    type: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'

    },
    description: {
        type: String,
        required: [true, 'Please provide a Description'],
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

module.exports = mongoose.model('PostType', postTypeSchema)