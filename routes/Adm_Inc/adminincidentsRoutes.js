const express = require('express');
const router = express.Router();
const Incident = require('../../models/Incident');
const Notification = require('../../models/Notification');
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


// 📌 ➤ Récupérer **tous** les incidents
router.get('/', async (req, res) => {
    try {
        const incidents = await Incident.find().sort({ createdAt: -1 }).populate('userId', 'email');

        // 🐞 DEBUG print
        console.log("✅ Incidents récupérés :", incidents);

        res.json({
            success: true,
            statusCode: 200,
            message: "Incidents récupérés avec succès.",
            incidents
        });

    } catch (error) {
        console.error("❌ Erreur lors de la récupération des incidents :", error);
        res.json({
            success: false,
            statusCode: 400,
            message: "Une erreur est survenue lors de la récupération des incidents.",
            error: error.message
        });
    }
});


// 📌 ➤ Récupérer un incident par ID
router.get('/:id', async(req, res) => {
    try {
        const incident = await Incident.findById(req.params.id).populate('userId', 'email');
        if (!incident) {
            return res.json({ success: false, statusCode: 400, message: "Incident non trouvé." });
        }
        res.json({ success: true, statusCode: 200, message: "Incident trouvé.", incident });
    } catch (error) {
        console.error("❌ Erreur lors de la récupération de l'incident :", error);
        res.json({ success: false, statusCode: 400, message: "Erreur serveur." });
    }
});

router.patch('/verify/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const incident = await Incident.findById(id);
        if (!incident) {
            return res.json({ success: false, statusCode: 400, message: "Incident non trouvé." });
        }

        incident.verified = true;
        await incident.save();

        // Envoi notification à l'auteur
        const userId = incident.userId;
        const message = "✅ تم التحقق من البلاغ الخاص بك من قبل الإدارة.";
        await sendNotification(userId, message);

        res.json({ success: true, statusCode: 200, message: "Incident vérifié et notification envoyée." });

    } catch (error) {
        console.error("❌ Erreur lors de la vérification de l'incident :", error);
        res.json({ success: false, statusCode: 400, message: "Erreur serveur." });
    }
});


// 📌 ➤ Récupérer les incidents par **type**
router.get('/incidentType/:incidentType', async(req, res) => {
    try {
        const { incidentType } = req.params;
        const incidents = await Incident.find({ incidentType }).sort({ createdAt: -1 });

        if (incidents.length === 0) {
            return res.json({ success: false, statusCode: 400, message: "Aucun incident trouvé pour ce type." });
        }

        res.json({ success: true, statusCode: 200, message: "Incidents trouvés.", incidents });

    } catch (error) {
        console.error("❌ Erreur lors de la récupération des incidents par type :", error);
        res.json({ success: false, statusCode: 400, message: "Erreur serveur." });
    }
});

// 📌 ➤ Récupérer les incidents par **sous-type**
router.get('/subIncidentType/:subIncidentType', async(req, res) => {
    try {
        const { subIncidentType } = req.params;
        const incidents = await Incident.find({ subIncidentType }).sort({ createdAt: -1 });

        if (incidents.length === 0) {
            return res.json({ success: false, statusCode: 400, message: "Aucun incident trouvé pour ce sous-type." });
        }

        res.json({ success: true, statusCode: 200, message: "Incidents trouvés.", incidents });

    } catch (error) {
        console.error("❌ Erreur lors de la récupération des incidents par sous-type :", error);
        res.json({ success: false, statusCode: 400, message: "Erreur serveur." });
    }
});

router.patch('/status/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const incident = await Incident.findById(id);
        if (!incident) {
            return res.status(404).json({ success: false, message: "Incident non trouvé." });
        }

        incident.status = "résolu";
        await incident.save();

        // Envoi notification à l'auteur
        const userId = incident.userId;
        const message = "📬 تم تغيير حالة البلاغ الخاص بك إلى 'تم الحل'. شكراً لك.";
        await sendNotification(userId, message);

        res.status(200).json({ success: true, message: "Statut mis à jour et notification envoyée." });

    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour du statut :", error);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
});


// 📌 ➤ Supprimer un incident
router.delete('/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const incident = await Incident.findByIdAndDelete(id);

        if (!incident) {
            return res.json({ success: false, statusCode: 400, message: "Incident non trouvé." });
        }

        res.json({ success: true, statusCode: 200, message: "Incident supprimé avec succès." });
    } catch (error) {
        console.error("❌ Erreur lors de la suppression :", error);
        res.json({ success: false, statusCode: 400, message: "Erreur serveur." });
    }
});

module.exports = router;