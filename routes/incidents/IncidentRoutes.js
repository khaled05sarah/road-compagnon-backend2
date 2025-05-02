const express = require('express');
const router = express.Router();
const Incident = require('../../models/Incident');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 📸 Configuration de Multer pour le stockage des images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });
router.post('/', upload.single('photo'), async (req, res) => {
    try {
        console.log("🔧 Nouvelle requête reçue pour signaler un incident");

        // Get data from either JSON body or form fields
        const data = req.file ? {
            ...req.body,
            photo: `/uploads/${req.file.filename}`
        } : req.body;

        console.log("📥 Données reçues :", data);

        let {
            userId,
            comment,
            incidentType,
            subIncidentType,
            latitude,
            longitude
        } = data;

        // Validate mandatory fields
        if (!userId || !incidentType || !latitude || !longitude) {
            console.warn("⚠️ Champs obligatoires manquants");
            return res.status(400).json({
                success: false,
                message: "L'utilisateur, le type d'incident et la localisation sont obligatoires."
            });
        }

        // Convert latitude and longitude to float and validate
        latitude = parseFloat(latitude);
        longitude = parseFloat(longitude);

        if (isNaN(latitude) || isNaN(longitude)) {
            console.warn("⚠️ Latitude ou longitude invalide :", { latitude, longitude });
            return res.status(400).json({
                success: false,
                message: "Latitude et longitude doivent être des nombres valides."
            });
        }

        console.log("📍 Coordonnées converties :", { latitude, longitude });

        // Vérifications spécifiques selon le type d'incident
        if (incidentType === "تعليق") {
            if (!comment) {
                console.warn("⚠️ Commentaire requis pour 'تعليق' mais manquant.");
                return res.status(400).json({
                    success: false,
                    message: "Le champ commentaire est requis pour un incident de type 'تعليق'."
                });
            }
        } else if (incidentType === "صورة") {
            if (!req.file) {
                console.warn("⚠️ Photo requise pour 'صورة' mais manquante.");
                return res.status(400).json({
                    success: false,
                    message: "Le champ photo est requis pour un incident de type 'صورة'."
                });
            }
        } else {
            if (!subIncidentType) {
                console.warn("⚠️ Sous-type requis mais manquant pour :", incidentType);
                return res.status(400).json({
                    success: false,
                    message: "Le sous-type d'incident est requis pour ce type d'incident."
                });
            }
        }

        // Création de l'objet Incident avec format GeoJSON
        const newIncident = new Incident({
            userId,
            comment: comment || null,
            incidentType,
            subIncidentType: subIncidentType || null,
            photo: req.file ? `/uploads/${req.file.filename}` : null,
            location: {
                type: "Point",
                coordinates: [longitude, latitude]
            }
        });

        console.log("🛠️ Incident prêt à être sauvegardé :", newIncident);

        // Sauvegarde dans la base de données
        await newIncident.save();

        console.log("✅ Incident sauvegardé avec succès :", newIncident._id);

        res.status(201).json({
            success: true,
            message: "Incident signalé avec succès.",
            incident: newIncident
        });

    } catch (error) {
        console.error("❌ Erreur lors du signalement :", error);

        res.status(500).json({
            success: false,
            message: error.message || "Erreur serveur.",
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});




// 📌 ➤ Récupérer les commentaires (تعليق) à proximité
router.get('/commentaires-zone', async(req, res) => {
    try {
        let { latitude, longitude } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({ success: false, message: "Latitude et longitude sont obligatoires." });
        }

        latitude = parseFloat(latitude);
        longitude = parseFloat(longitude);

        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({ success: false, message: "Latitude et longitude doivent être valides." });
        }

        const commentaires = await Incident.find({
            incidentType: "تعليق",
            verified: true,
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: 5000 // 5 km max
                }
            }
        }).sort({ createdAt: -1 });

        if (commentaires.length === 0) {
            return res.status(404).json({ success: false, message: "Aucun commentaire trouvé dans cette zone." });
        }

        res.json({ success: true, commentaires });

    } catch (error) {
        console.error("❌ Erreur récupération commentaires:", error);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
});
// 📌 ➤ Récupérer les incidents à proximité par sous-type
router.get('/nearby/type', async(req, res) => {
    try {
        let { latitude, longitude, subIncidentType } = req.query;

        if (!latitude || !longitude || !subIncidentType) {
            return res.status(400).json({ success: false, message: "Latitude, longitude et sous-type requis." });
        }

        latitude = parseFloat(latitude);
        longitude = parseFloat(longitude);

        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({ success: false, message: "Latitude et longitude doivent être valides." });
        }

        const incidents = await Incident.find({
            verified: true,
            subIncidentType,
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: 5000 // 5 km
                }
            }
        }).sort({ createdAt: -1 });

        if (incidents.length === 0) {
            return res.status(404).json({ success: false, message: "Aucun incident trouvé pour ce sous-type dans cette zone." });
        }

        res.json({ success: true, incidents });

    } catch (error) {
        console.error("❌ Erreur récupération incidents par sous-type:", error);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
});

// 📌 ➤ Récupérer tous les incidents vérifiés
router.get('/verified', async(req, res) => {
    try {
        const incidents = await Incident.find({ verified: true }).sort({ createdAt: -1 });

        if (incidents.length === 0) {
            return res.status(404).json({ success: false, message: "Aucun incident vérifié trouvé." });
        }

        res.json({ success: true, incidents });

    } catch (error) {
        console.error("❌ Erreur lors de la récupération des incidents vérifiés :", error);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
});

// 📌 ➤ Récupérer les incidents par type et sous-type
router.get('/type/:incidentType/:subIncidentType?', async(req, res) => {
    try {
        const { incidentType, subIncidentType } = req.params;
        const query = { incidentType };

        if (subIncidentType) {
            query.subIncidentType = subIncidentType;
        }

        const incidents = await Incident.find(query).sort({ createdAt: -1 });

        if (incidents.length === 0) {
            return res.status(404).json({ success: false, message: "Aucun incident trouvé pour ce type/sous-type." });
        }

        res.json({ success: true, incidents });

    } catch (error) {
        console.error("❌ Erreur lors de la récupération des incidents par type :", error);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
});

router.get('/nearby', async (req, res) => {
    try {
        let { latitude, longitude } = req.query;

        console.log("📥 Requête reçue avec :", { latitude, longitude });

        if (!latitude || !longitude) {
            console.warn("⚠️ Latitude ou longitude manquante");
            return res.status(400).json({
                success: false,
                message: "Latitude et longitude sont obligatoires."
            });
        }

        latitude = parseFloat(latitude);
        longitude = parseFloat(longitude);

        if (isNaN(latitude) || isNaN(longitude)) {
            console.warn("⚠️ Latitude ou longitude invalide :", { latitude, longitude });
            return res.status(400).json({
                success: false,
                message: "Latitude et longitude doivent être des nombres valides."
            });
        }

        console.log("📍 Coordonnées converties :", { latitude, longitude });

        const incidents = await Incident.find({
            verified: true,
            status: { $ne: "résolu" },
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: 2000
                }
            }
        }).sort({ createdAt: -1 });

        console.log(`📦 Incidents trouvés : ${incidents.length}`);
        if (incidents.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Aucun incident non résolu trouvé à proximité."
            });
        }

        res.json({ success: true, incidents });

    } catch (error) {
        console.error("❌ Erreur lors de la récupération des incidents par géolocalisation :", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur."
        });
    }
});



module.exports = router;