const express = require('express');
const router = express.Router();
const Panneau = require('../../models/cours/panneau');
router.get('/exemples', async (req, res) => {
    try {
        const panneaux = await Panneau.find({}, 'exemples'); // Récupérer uniquement les exemples
        const allExemples = panneaux.flatMap(panneau => panneau.exemples); // Fusionner tous les exemples en un seul tableau

        res.json(allExemples);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des exemples :", error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});
router.get('/panneaux', async (req, res) => {
    try {
        const panneaux = await Panneau.find({}, 'categorie explication_generale exemples'); // Récupérer les champs nécessaires

        res.json(panneaux);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des panneaux :", error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

// Route pour récupérer un exemple spécifique d'une catégorie avec un index dynamique
router.get('/exemple/:categorie', async (req, res) => {
    const { categorie } = req.params;
    console.log("🔎 Catégorie reçue :", categorie); // Debug

    try {
        const panneau = await Panneau.findOne({ categorie });

        if (!panneau) {
            console.log("❌ Catégorie introuvable !");
            return res.status(404).json({ message: 'Catégorie introuvable' });
        }

        console.log("✅ Panneau trouvé :", panneau);
        res.json(panneau.exemples);

    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});
router.get('/exemple/:categorie/:index', async (req, res) => {
    const { categorie, index } = req.params;
    const indexNum = Number(index); // Convertir en nombre

    // Vérifier si index est un nombre valide
    if (!Number.isInteger(indexNum) || indexNum < 0) {
        return res.status(400).json({ message: 'Index invalide' });
    }

    try {
        // Rechercher la catégorie dans la base de données
        const panneau = await Panneau.findOne({ categorie });

        if (!panneau) {
            return res.status(404).json({ message: 'Catégorie introuvable' });
        }

        // Vérifier si l'index existe
        if (indexNum >= panneau.exemples.length) {
            return res.status(404).json({ message: 'Index hors limites' });
        }

        // Retourner l'exemple demandé
        res.json(panneau.exemples[indexNum]);

    } catch (error) {
        console.error("Erreur lors de la récupération de l'exemple :", error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});
router.get('/explication/:categorie', async (req, res) => {
    const { categorie } = req.params;
    console.log("🔎 Catégorie reçue :", categorie); // Debug

    try {
        const panneau = await Panneau.findOne({ categorie });

        if (!panneau) {
            console.log("❌ Catégorie introuvable !");
            return res.status(404).json({ message: 'Catégorie introuvable' });
        }

        console.log("✅ Explication trouvée :", panneau.explication_generale);
        res.json({ categorie: panneau.categorie, explication: panneau.explication_generale });

    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});


module.exports = router;
