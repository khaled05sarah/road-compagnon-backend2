const express = require('express');
const router = express.Router();
const Croisement = require('../../models/cours/croisement');

// Route pour récupérer l'explication générale du croisement
router.get('/explication_generale', async(req, res) => {
    try {
        const croisement = await Croisement.findOne(); // Récupérer le premier croisement

        if (!croisement) {
            return res.status(404).json({ message: 'Aucune donnée trouvée' });
        }

        res.json({ explication_generale: croisement.explication_generale });
    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

// Route pour récupérer tous les paragraphes du croisement
router.get('/paragraphes', async(req, res) => {
    try {
        const croisement = await Croisement.findOne();

        if (!croisement || !croisement.paragraphes) {
            return res.status(404).json({ message: 'Aucune donnée trouvée' });
        }

        res.json(croisement.paragraphes);
    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});
router.get('/images', async (req, res) => {
    try {
        // Récupérer toutes les images de la base de données
        const croisements = await Croisement.find({}, 'images');
        
        // Extraire uniquement les tableaux d'images
        const allImages = croisements.flatMap(croisement => croisement.images);

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
        const croisements = await Croisement.find({}, 'images');

        let allImages = [];
        croisements.forEach(croisement => {
            if (croisement.images) {
                allImages = allImages.concat(croisement.images);
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

// Route pour récupérer un paragraphe spécifique avec un index dynamique
router.get('/paragraphes/:index', async(req, res) => {
    const { index } = req.params;
    const indexNum = Number(index);

    if (!Number.isInteger(indexNum) || indexNum < 0) {
        return res.status(400).json({ message: 'Index invalide' });
    }

    try {
        const croisement = await Croisement.findOne();
        if (!croisement) {
            return res.status(404).json({ message: 'Aucune donnée trouvée' });
        }

        if (indexNum >= croisement.paragraphes.length) {
            return res.status(404).json({ message: 'Index hors limites' });
        }

        res.json(croisement.paragraphes[indexNum]);
    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

module.exports = router;