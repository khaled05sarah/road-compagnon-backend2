const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Référence à l'utilisateur
        required: true
    },
    
    score: {
        type: Number,
        default: 0 // Score total de l'utilisateur
    },
    createdAt: {
        type: Date,
        default: Date.now // Date de la tentative
    }
});

const Attempt = mongoose.model('Attempt', attemptSchema);

module.exports = Attempt;
