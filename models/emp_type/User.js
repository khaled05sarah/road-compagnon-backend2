const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstname: { type: String, required: false, default: "" }, // Plus obligatoire
    lastname: { type: String, required: false, default: "" },  // Plus obligatoire
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    verificationCode: { type: String }, // Code de vérification email
    resetCode: { type: String,default:"" }, // Code pour réinitialisation du mot de passe
    sex: { type: String, required: false, enum: ["أنثى", "ذكر"], default: "ذكر" }, // Plus obligatoire
    role: { type: String, default: "مستخدم عادي", enum: ["مستخدم عادي", "ميكانيكي", "بائع قطع الغيار", "عامل سحب السيارات"] }
}, { timestamps: true });
;

module.exports = mongoose.model('User', UserSchema);