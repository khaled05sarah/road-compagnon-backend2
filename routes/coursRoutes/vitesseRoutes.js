const express = require('express');
const router = express.Router();
const Vitesse = require('../../models/cours/vitesse'); // Vérifie que le modèle est au bon endroit

// Route pour récupérer l'explication générale du croisement
router.get('/explication_generale', async(req, res) => {
    try {
        const vitesse = await Vitesse.findOne(); // Récupérer le premier croisement

        if (!vitesse) {
            return res.status(404).json({ message: 'Aucune donnée trouvée' });
        }

        res.json({ explication_generale: vitesse.explication_generale });
    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

// Route pour récupérer tous les paragraphes
router.get('/paragraphes', async(req, res) => {
    try {
        const vitesse = await Vitesse.findOne();

        if (!vitesse || !vitesse.paragraphes) {
            return res.status(404).json({ message: 'Aucune donnée trouvée' });
        }
        res.status(200).json(vitesse.paragraphes);

    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});
// ✅ Récupérer un paragraphe par son index sans spécifier l'ID de l'autoroute
router.get('/paragraphes/:index', async(req, res) => {
    try {
        const { index } = req.params;

        // Récupérer le premier document dans la collection Autoroute
        const vitesse = await Vitesse.findOne();

        if (!vitesse) {
            return res.status(404).json({ message: "Aucun document trouvé" });
        }

        const paragraphes = vitesse.paragraphes;

        if (index < 0 || index >= paragraphes.length) {
            return res.status(400).json({ message: "Index invalide" });
        }

        res.json({ paragraphe: paragraphes[index] });

    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});
router.get('/images', async (req, res) => {
    try {
        // Récupérer toutes les images de la base de données
        const vitesse = await Vitesse.find({}, 'images');
        
        // Extraire uniquement les tableaux d'images
        const allImages = vitesse.flatMap(vitesse => vitesse.images);

        res.status(200).json({ images: allImages });
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des images :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
});
module.exports = router; // Assure-toi que tu exportes bien `router`