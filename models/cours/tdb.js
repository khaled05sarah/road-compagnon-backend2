const mongoose = require('mongoose');

const tdbSchema = new mongoose.Schema({
    explication_generale: { type: String, required: true },
    paragraphes: [{
        _id: false,
        description: { type: String, required: true }
    }],
    images: [{ type: String }]
}, { timestamps: true });

const Tdb = mongoose.model('Tdb', tdbSchema);
module.exports = Tdb;