const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, trim: true },
    photo: { type: String, trim: true },
    incidentType: {
        type: String,
        enum: ["حادث", "ازدحام مروري", "مسار مسدود", "طقس سيء", "خطر", "طريق مغلق", "صورة", "تعليق"],
        required: true
    },
    subIncidentType: {
        type: String,
        enum: [
            "تصادم متسلسل", "عكس الاتجاه", "احتراق السيارة", "صدم المشاة", "انقلاب سيارة","حادث",
            "مسار مسدود", "ازدحام شديد", "توقف السيارات",
            "المسار الأيسر", "المسار الأيمن", "المسار الأوسط",
            "طريق زلق", "فيضانات", "ضباب","طقس سيئ",
            "أشغال الطرق", "إشارة معطلة", "حفرة", "سقوط شيء","خطر",
            "طريق مغلق"
        ],
        required: function () {
            return this.incidentType !== "صورة" && this.incidentType !== "تعليق";
        }
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    verified: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ["en attente", "en cours", "résolu"],
        default: "en attente"
    },
    createdAt: { type: Date, default: Date.now }
});

// 📍 Ajout de l'index géospatial
IncidentSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Incident', IncidentSchema);


