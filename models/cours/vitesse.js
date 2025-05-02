const mongoose = require('mongoose');

const vitesseSchema = new mongoose.Schema({
    explication_generale: { type: String, required: true },
    paragraphes: [{
        _id: false,
        description: { type: String, required: true }
    }],
    images: [{ type: String }] 
}, { timestamps: true });

const Vitesse = mongoose.model('Vitesse', vitesseSchema);
module.exports = Vitesse;