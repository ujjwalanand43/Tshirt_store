const mongoose = require('mongoose');
const validator = require('validator');


const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
    },
    type: {
        type: String,
        ref: "CategoryType",
        required: true
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

module.exports = mongoose.model('Category', categorySchema)