const express = require('express');
const router = express.Router();
const Marquage = require('../../models/cours/marquage'); // Vérifie que le modèle est au bon endroit

// Route pour récupérer l'explication générale du croisement
router.get('/explication_generale', async(req, res) => {
    try {
        const marquage = await Marquage.findOne(); // Récupérer le premier croisement

        if (!marquage) {
            return res.status(404).json({ message: 'Aucune donnée trouvée' });
        }

        res.json({ explication_generale: marquage.explication_generale });
    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

// Route pour récupérer tous les paragraphes
router.get('/paragraphes', async(req, res) => {
    try {
        const marquage = await Marquage.findOne();

        if (!marquage || !marquage.paragraphes) {
            return res.status(404).json({ message: 'Aucune donnée trouvée' });
        }

        res.json(marquage.paragraphes);
    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});
router.get('/images', async (req, res) => {
    try {
        // Récupérer toutes les images de la base de données
        const marquage = await Marquage.find({}, 'images');
        
        // Extraire uniquement les tableaux d'images
        const allImages = marquage.flatMap(marquage => marquage.images);

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
        const marquage = await Marquage.findOne();

        if (!marquage) {
            return res.status(404).json({ message: "Aucun document trouvé" });
        }

        const paragraphes = marquage.paragraphes;

        if (index < 0 || index >= paragraphes.length) {
            return res.status(400).json({ message: "Index invalide" });
        }

        res.json({ paragraphe: paragraphes[index] });

    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

module.exports = router; // Assure-toi que tu exportes bien `router`