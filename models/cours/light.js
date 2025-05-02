const mongoose = require('mongoose');

const lightSchema = new mongoose.Schema({
    explication_generale: { type: String, required: true },
    paragraphes: [{
        _id: false,
        description: { type: String, required: true }
    }],
    images: [{ type: String }]
}, { timestamps: true });

const Light = mongoose.model('Light', lightSchema);
module.exports = Light;