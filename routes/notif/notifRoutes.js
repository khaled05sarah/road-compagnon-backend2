const express = require('express');
const router = express.Router();
const Notification = require('../../models/Notification');
// ➤ Récupérer toutes les notifications d'un utilisateur
router.get('/notifications/:userId', async(req, res) => {
    try {
        const { userId } = req.params;

        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            notifications,
        });

    } catch (error) {
        console.error('❌ Erreur lors de la récupération des notifications:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
});

// ➤ Marquer une seule notification comme lue
router.patch('/notifications/:notificationId', async(req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification introuvable."
            });
        }

        notification.read = true;
        await notification.save();

        res.status(200).json({
            success: true,
            message: "Notification marquée comme lue.",
            notification,
        });

    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour de la notification:", error);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
});

// ➤ Marquer TOUTES les notifications d'un utilisateur comme lues
router.patch('/notifications/mark-all-read/:userId', async(req, res) => {
    try {
        const { userId } = req.params;

        await Notification.updateMany({ userId, read: false }, { $set: { read: true } });

        res.status(200).json({
            success: true,
            message: "Toutes les notifications ont été marquées comme lues.",
        });

    } catch (error) {
        console.error("❌ Erreur lors du marquage de toutes les notifications:", error);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
});

// ➤ Obtenir le NOMBRE de notifications NON lues
router.get('/notifications/unread/count/:userId', async(req, res) => {
    try {
        const { userId } = req.params;

        const count = await Notification.countDocuments({ userId, read: false });

        res.status(200).json({
            success: true,
            unreadCount: count,
        });

    } catch (error) {
        console.error("❌ Erreur lors de la récupération du nombre de notifications non lues:", error);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
});

router.delete('/notifications/:notificationId', async(req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findByIdAndDelete(notificationId);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification introuvable pour suppression."
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification supprimée avec succès."
        });

    } catch (error) {
        console.error("❌ Erreur lors de la suppression de la notification:", error);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
});

router.delete('/notifications/:userId', async(req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ success: false, message: "userId est requis." });
        }

        const result = await Notification.deleteMany({ userId: userId });

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} notifications supprimées pour l'utilisateur ${userId}.`
        });

    } catch (error) {
        console.error("❌ Erreur lors de la suppression des notifications de l'utilisateur :", error);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
});


module.exports = router;