const mongoose = require('mongoose');

const croisementSchema = new mongoose.Schema({
    explication_generale: { type: String, required: true },
    paragraphes: [{
        _id: false,
        description: { type: String, required: true }
    }],
    images: [{ type: String }] // Tableau des URLs des images
}, { timestamps: true });

const Croisement = mongoose.model('Croisement', croisementSchema);
module.exports = Croisement;
