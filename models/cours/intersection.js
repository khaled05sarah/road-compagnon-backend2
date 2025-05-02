const mongoose = require('mongoose');

const intersectionSchema = new mongoose.Schema({
    explication_generale: { type: String, required: true },
    paragraphes: [{
        _id: false,
        description: { type: String, required: true }
    }]
}, { timestamps: true });

const Intersection = mongoose.model('Intersection', intersectionSchema);
module.exports = Intersection;