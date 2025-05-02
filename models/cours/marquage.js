const mongoose = require('mongoose');

const marquageSchema = new mongoose.Schema({
    explication_generale: { type: String, required: true },
    paragraphes: [{
        _id: false,
        description: { type: String, required: true }
    }],
    images: [{ type: String }]
}, { timestamps: true });

const Marquage = mongoose.model('Marquage', marquageSchema);
module.exports = Marquage;