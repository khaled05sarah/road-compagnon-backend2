const mongoose = require('mongoose');

const prioriteSchema = new mongoose.Schema({
    explication_generale: { type: String, required: true },
    paragraphes: [{
        _id: false,
        description: { type: String, required: true }
    }],
    images: [{ type: String }] 
}, { timestamps: true });

const Priorite = mongoose.model('Priorite', prioriteSchema, 'priorites'); // ou le vrai nom que tu vois dans Atlas

module.exports = Priorite;