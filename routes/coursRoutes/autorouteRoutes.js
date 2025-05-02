const express = require('express');
const router = express.Router();
const Autoroute = require('../../models/cours/autoroute'); // Vérifie que le modèle est au bon endroit

// Route pour récupérer l'explication générale du croisement
router.get('/explication_generale', async(req, res) => {
    try {
        const autoroute = await Autoroute.findOne(); // Récupérer le premier croisement

        if (!autoroute) {
            return res.status(404).json({ message: 'Aucune donnée trouvée' });
        }

        res.json({ explication_generale: autoroute.explication_generale });
    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

// Route pour récupérer tous les paragraphes
router.get('/paragraphes', async(req, res) => {
    try {
        const autoroute = await Autoroute.findOne();

        if (!autoroute || !autoroute.paragraphes) {
            return res.status(404).json({ message: 'Aucune donnée trouvée' });
        }

        res.json(autoroute.paragraphes);
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
        const autoroute = await Autoroute.findOne();

        if (!autoroute) {
            return res.status(404).json({ message: "Aucun document trouvé" });
        }

        const paragraphes = autoroute.paragraphes;

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
        const autoroute = await Autoroute.find({}, 'images');
        
        // Extraire uniquement les tableaux d'images
        const allImages = autoroute.flatMap(autoroute => autoroute.images);

        res.status(200).json({ images: allImages });
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des images :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
});

// 📌 Route pour récupérer une seule image par index global
router.get('/images/:index', async (req, res) => {
    try {
        const { index } = req.params;
        const imageIndex = parseInt(index);

        // Vérifier si l'index est valide
        if (isNaN(imageIndex) || imageIndex < 0) {
            return res.status(400).json({ message: "Index d'image invalide" });
        }

        // Récupérer toutes les images de tous les croisements
        const autoroute = await Autoroute.find({}, 'images');

        let allImages = [];
        autoroute.forEach(autoroute => {
            if (autoroute.images) {
                allImages = allImages.concat(autoroute.images);
            }
        });

        // Vérifier si l'index est dans la plage des images disponibles
        if (imageIndex >= allImages.length) {
            return res.status(404).json({ message: "Aucune image trouvée pour cet index" });
        }

        res.status(200).json({ image: allImages[imageIndex] });
    } catch (error) {
        console.error("❌ Erreur lors de la récupération de l'image :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
});
module.exports = router; // Assure-toi que tu exportes bien `router`