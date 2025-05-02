const mongoose = require('mongoose');

const PaiementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    role: {
        type: String,
        enum: ["ميكانيكي", "عامل سحب السيارات", "بائع قطع الغيار"],
        required: true
    },

    preuvePaiement: { // ✅ Doit correspondre au nom utilisé dans le contrôleur
        type: String,
        required: true
    },

    statut: {
        type: String,
        enum: ["en attente", "accepté", "refusé"],
        default: "en attente"
    },

    mois: { // format: '04-2025'
        type: String,
        required: true
    },

    estHorsDelai: {
        type: Boolean,
        default: false
    },

    commentaireAdmin: {
        type: String,
        default: null
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Paiement', PaiementSchema);