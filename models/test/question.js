const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    image: { type: String, required: false }, // Facultatif, certaines questions n'ont pas d'image
    question: { type: String, required: true },
    options: { type: [String], required: true }, // Tableau d'options de réponse
    correctAnswer: { type: String, required: true }, // Réponse correcte
    explanation: { type: String, required: false } // Explication (facultatif)
});

module.exports = mongoose.model('Question', questionSchema);
