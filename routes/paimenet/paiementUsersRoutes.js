const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Paiement = require('../../models/paiement');
const User = require('../../models/emp_type/User');

// 📁 Config Multer pour upload photo de reçu
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/recus/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// 📌 ➤ Route pour envoyer un paiement
router.post('/payer', upload.single('recu'), async(req, res) => {
    try {
        const { userId } = req.body;

        if (!userId || !req.file) {
            return res.status(400).json({
                success: false,
                message: "📩 ID utilisateur et photo du reçu requis."
            });
        }

        const user = await User.findById(userId);
        if (!user || !["ميكانيكي", "عامل سحب السيارات", "بائع قطع الغيار"].includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: "❌ Seuls les professionnels peuvent payer."
            });
        }

        const now = new Date();
        const dateInscription = new Date(user.createdAt);

        // 💡 Calcul du "début de mois personnel"
        const day = dateInscription.getDate();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), day);

        if (now < currentMonthStart) {
            // Cas où on est avant la date anniversaire du mois : on recule d’un mois
            currentMonthStart.setMonth(currentMonthStart.getMonth() - 1);
        }

        const currentMonthEnd = new Date(currentMonthStart);
        currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);

        // 📆 Format personnalisé du mois (par ex: "12-03-2024 à 11-04-2024")
        const mois = `${currentMonthStart.toISOString().split('T')[0]} à ${currentMonthEnd.toISOString().split('T')[0]}`;

        // ⏳ Vérifier si l’utilisateur est hors délai (plus de 10 jours après début de mois perso)
        const delaiLimite = new Date(currentMonthStart);
        delaiLimite.setDate(delaiLimite.getDate() + 10);
        const estHorsDelai = now > delaiLimite;

        // 🔁 Vérifier si un paiement a déjà été fait pendant ce mois perso
        const existing = await Paiement.findOne({
            userId,
            mois
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "✅ Paiement déjà envoyé pour votre période mensuelle."
            });
        }

        const paiement = new Paiement({
            userId,
            role: user.role,
            mois,
            preuvePaiement: `/uploads/recus/${req.file.filename}`,
            statut: "en attente",
            estHorsDelai
        });

        await paiement.save();

        res.status(201).json({
            success: true,
            message: "📤 Paiement envoyé avec succès pour votre période mensuelle.",
            paiement
        });

    } catch (error) {
        console.error("❌ Erreur lors de l'envoi du paiement :", error);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
});


module.exports = router;