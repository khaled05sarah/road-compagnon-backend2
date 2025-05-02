const mongoose = require('mongoose');

const feuSchema = new mongoose.Schema({
    explication_generale: { type: String, required: true },
    paragraphes: [{
        _id: false,
        description: { type: String, required: true }
    }],
    images: [{ type: String }]
}, { timestamps: true });

const Feu = mongoose.model('Feu', feuSchema);
module.exports = Feu;