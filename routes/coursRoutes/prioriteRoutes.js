const express = require('express');
const router = express.Router();
const Priorite = require('../../models/cours/priorite'); // Vérifie que le modèle est au bon endroit

// Route pour récupérer l'explication générale du croisement
router.get('/explication_generale', async(req, res) => {
    try {
        const priorite = await Priorite.findOne(); // Récupérer le premier croisement

        if (!priorite) {
            return res.status(404).json({ message: 'Aucune donnée trouvée' });
        }

        res.json({ explication_generale: priorite.explication_generale });
    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});
router.get('/paragraphes', async(req, res) => {
    try {
        const priorite = await Priorite.findOne();
        console.log("Document trouvé:", priorite);

        if (!priorite || !priorite.paragraphes) {
            return res.status(404).json({ message: 'Aucune donnée trouvée' });
        }

        res.json(priorite.paragraphes);
    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});
router.get('/images', async (req, res) => {
    try {
        // Récupérer toutes les images de la base de données
        const priorite = await Priorite.find({}, 'images');
        
        // Extraire uniquement les tableaux d'images
        const allImages = priorite.flatMap(priorite=> priorite.images);

        res.status(200).json({ images: allImages });
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des images :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
});
// ✅ Récupérer un paragraphe par son index sans spécifier l'ID de l'autoroute
router.get('/paragraphes/:index', async(req, res) => {
    try {
        const { index } = req.params;

        // Récupérer le premier document dans la collection Autoroute
        const priorite = await Priorite.findOne();

        if (!priorite) {
            return res.status(404).json({ message: "Aucun document trouvé" });
        }

        const paragraphes = priorite.paragraphes;

        if (index < 0 || index >= paragraphes.length) {
            return res.status(400).json({ message: "Index invalide" });
        }

        res.json({ paragraphe: paragraphes[index] });

    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

module.exports = router; // Assure-toi que tu exportes bien `router`