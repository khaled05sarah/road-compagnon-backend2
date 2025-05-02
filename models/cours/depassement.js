const mongoose = require('mongoose');

const depassementSchema = new mongoose.Schema({
    explication_generale: { type: String, required: true },
    paragraphes: [{
        _id: false,
        description: { type: String, required: true }
    }],
    images: [{ type: String }] 
}, { timestamps: true });

const Depassement = mongoose.model('Depassement', depassementSchema);
module.exports = Depassement;