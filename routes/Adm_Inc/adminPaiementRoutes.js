const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const Paiement = require('../../models/paiement');
const User = require('../../models/emp_type/User');
const Notification = require('../../models/Notification');

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USERr,
        pass: process.env.EMAIL_PASSs
    }
});

// Fonction pour créer une notification
const sendNotification = async(userId, message) => {
    try {

        const newNotif = await Notification.create({
            userId,
            message,
            read: false
        });

        console.log(`✅ Notification créée pour ${userId}`);
        return newNotif;
    } catch (error) {
        console.error('❌ Erreur lors de l’enregistrement de la notification :', error.message);
    }
};


// 🚨 Vérification et suppression des comptes inactifs
router.get('/verifier-paiements', async(req, res) => {
            try {
                const professionnels = await User.find({
                    role: { $in: ["ميكانيكي", "عامل سحب السيارات", "بائع قطع الغيار"] }
                });

                const aujourdHui = new Date();
                const comptesASupprimer = [];
                const comptesANotifier = [];

                for (const user of professionnels) {
                    const dateInscription = new Date(user.createdAt);
                    const jourInscription = dateInscription.getDate();

                    let debutMoisPerso = new Date(
                        aujourdHui.getFullYear(),
                        aujourdHui.getMonth(),
                        jourInscription
                    );

                    if (aujourdHui < debutMoisPerso) {
                        debutMoisPerso.setMonth(debutMoisPerso.getMonth() - 1);
                    }

                    const dateLimite = new Date(debutMoisPerso);
                    dateLimite.setDate(dateLimite.getDate() + 12);

                    const dateNotification = new Date(debutMoisPerso);
                    dateNotification.setDate(dateNotification.getDate() + 10);

                    const aEffectuePaiement = await Paiement.exists({
                        userId: user._id,
                        createdAt: { $gte: debutMoisPerso, $lte: dateLimite }
                    });

                    if (aujourdHui > dateLimite && !aEffectuePaiement) {
                        comptesASupprimer.push(user);
                    } else if (aujourdHui >= dateNotification && aujourdHui < dateLimite && !aEffectuePaiement) {
                        const dejaNotifie = await Notification.exists({
                            userId: user._id,
                            message: /paiement/,
                            createdAt: { $gte: debutMoisPerso }
                        });

                        if (!dejaNotifie) {
                            comptesANotifier.push(user);
                        }
                    }
                }

                // ✅ Notifications aux utilisateurs à J+10
                for (const user of comptesANotifier) {
                    const dateLimite = new Date(user.createdAt);
                    dateLimite.setDate(dateLimite.getDate() + 12);
                    const dateLimiteStr = dateLimite.toLocaleDateString();

                    const message = `📢 Rappel : Vous avez jusqu'au ${dateLimiteStr} pour effectuer votre paiement mensuel.`;

                    await sendNotification(user._id, message);

                    await transporter.sendMail({
                        from: process.env.USERr,
                        to: user.email,
                        subject: 'Rappel de paiement',
                        html: `
                    <p>Bonjour ${user.firstname},</p>
                    <p>${message}</p>
                    <p>Merci de régulariser votre situation.</p>
                `
                    });
                }

                // ❌ Suppression des comptes (email seulement)
                for (const user of comptesASupprimer) {
                    const emailMessage = "❌ Votre compte a été désactivé pour défaut de paiement.";

                    // ❌ PAS de notification enregistrée ici, juste un email
                    await transporter.sendMail({
                        from: process.env.EMAIL_USERr,
                        to: user.email,
                        subject: 'Désactivation de votre compte',
                        html: `
                    <p>Bonjour ${user.firstname},</p>
                    <p>${emailMessage}</p>
                    <p>Contactez le support pour plus d'informations.</p>
                `
                    });

                    await User.findByIdAndDelete(user._id);
                    await Paiement.deleteMany({ userId: user._id });
                }

                // ✅ Rapport à l'admin
                if (comptesASupprimer.length > 0) {
                    await transporter.sendMail({
                                from: process.env.EMAIL_USERr,
                                to: process.env.EMAIL_USERr, // ou process.env.ADMIN_EMAIL si défini
                                subject: `[${new Date().toLocaleDateString()}] Suppression de comptes`,
                                html: `
                    <h2>Rapport de suppression</h2>
                    <p>${comptesASupprimer.length} comptes ont été supprimés :</p>
                    <ul>
                        ${comptesASupprimer.map(user => `
                            <li>${user.firstname} (${user.email})</li>
                        `).join('')}
                    </ul>
                `
            });
        }

        res.json({
            success: true,
            notificationsEnvoyees: comptesANotifier.length,
            comptesSupprimes: comptesASupprimer.length,
            message: [
                comptesANotifier.length > 0 ? `📨 ${comptesANotifier.length} notifications envoyées` : null,
                comptesASupprimer.length > 0 ? `♻️ ${comptesASupprimer.length} comptes supprimés` : null,
                (comptesANotifier.length === 0 && comptesASupprimer.length === 0) ? '✅ Aucune action nécessaire' : null
            ].filter(Boolean).join(' | ')
        });

    } catch (err) {
        console.error('❌ Erreur lors de la vérification :', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: err.message
        });
    }
});

router.get('/paiements', async (req, res) => {
    try {
        const paiements = await Paiement.find({ statut: 'en attente' })
            .populate('userId', 'firstname lastname email role');

        res.status(200).json({
            success: true,
            message: "📄 Paiements en attente récupérés avec succès.",
            paiements
        });
    } catch (error) {
        console.error("❌ Erreur récupération paiements :", error);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
});


// 📌 ➤ Valider un paiement
router.patch('/:id/valider', async(req, res) => {
    try {
        const paiement = await Paiement.findByIdAndUpdate(
            req.params.id, { statut: "validé" }, { new: true }
        );

        if (!paiement) {
            return res.status(404).json({ success: false, message: "Paiement non trouvé." });
        }

        // ✅ Envoyer une notification à l’utilisateur concerné
        const user = await User.findById(paiement.userId);
        if (user) {
            const notifMessage = "تم قبول الدفع الخاص بك بنجاح. شكرًا لك!";
            await sendNotification(user._id, notifMessage);

            console.log(`📨 Notification envoyée à ${user.nom}`);
        }

        res.status(200).json({
            success: true,
            message: "✅ Paiement validé avec succès.",
            paiement
        });
    } catch (error) {
        console.error("❌ Erreur validation :", error);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
});

// 📌 ➤ Refuser un paiement
router.patch('/:id/refuser', async(req, res) => {
    try {
        const paiement = await Paiement.findByIdAndUpdate(
            req.params.id, { statut: "refusé" }, { new: true }
        );

        if (!paiement) {
            return res.status(404).json({ success: false, message: "Paiement non trouvé." });
        }

        // ❌ Envoyer une notification à l’utilisateur concerné
        const user = await User.findById(paiement.userId);
        if (user) {
            const notifMessage = "تم رفض الدفع الخاص بك, يرجى إعادة الإرسال";
            await sendNotification(user._id, notifMessage);

            console.log(`📨 Notification de refus envoyée à ${user.nom}`);
        }

        res.status(200).json({
            success: true,
            message: "❌ Paiement refusé avec succès.",
            paiement
        });
    } catch (error) {
        console.error("❌ Erreur refus :", error);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
});

module.exports = router;