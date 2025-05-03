const mongoose = require('mongoose');

const prioriteSchema = new mongoose.Schema({
    explication_generale: { type: String, required: true },
    paragraphes: [{
        _id: false,
        description: { type: String, required: true }
    }],
    images: [{ type: String }] 
}, { timestamps: true });

const Priorite = mongoose.model('Priorite', prioriteSchema);
module.exports = Priorite;