const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    businessAddress: { type: String, required: true },
    phonePro: { type: String, required: true },
    profilePhoto: { type: String, required: true },
    commerceRegister: { type: String, required: true },
    carteidentite: { type: String, required: true },
    online: { type: Boolean, default: false }, // Statut de connexion en temps réel
    currentLocation: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null }
    }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', VendorSchema);
