const mongoose = require('mongoose');

const panneauSchema = new mongoose.Schema({
    categorie: { 
        type: String, 
        required: true, 
        enum: ["arret_stop", "interdiction", "temp", "indication", "danger", "priorite", "obligation"] 
    },
    explication_generale: { type: String, required: true },
    exemples: [
        {
            _id: false,
            description: { type: String, required: true },
            image: { type: String, required: true } // Ajout du champ image (URL de l'image)
        }
    ]
}, { timestamps: true });

const Panneau = mongoose.model('Panneau', panneauSchema);

module.exports = Panneau;
