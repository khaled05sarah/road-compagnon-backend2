const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Client qui fait la demande

  serviceType: { 
    type: String, 
    enum: ["ميكانيكي", "عامل سحب السيارات", "بائع قطع الغيار"], 
    required: true 
  }, // Type de service demandé

  location: { 
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }, // Localisation du client

  status: { 
    type: String, 
    enum: ["en attente", "acceptée", "terminée", "annulée"], 
    default: "en attente" 
  }, // État de la demande

  assignedProvider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Prestataire assigné

  createdAt: { type: Date, default: Date.now }, // Date de création de la demande

  // Champs spécifiques pour les demandes de pièces
  pieceName: { type: String, default: null },     // Nom de la pièce demandée
  carModel: { type: String, default: null }       // Modèle de voiture concerné
});

module.exports = mongoose.model('Request', RequestSchema);
