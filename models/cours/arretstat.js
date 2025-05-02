const mongoose = require('mongoose');

const arretstatSchema = new mongoose.Schema({
    explication_generale: { type: String, required: true },
    paragraphes: [{
        _id: false,
        description: { type: String, required: true }
    }],
    images: [{ type: String }]
}, { timestamps: true });

const Arretstat = mongoose.model('Arretstat', arretstatSchema);
module.exports = Arretstat;