require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const Request = require('./models/Request'); 
const Mechanic = require('./models/emp_type/Mechanic');
const Towing = require('./models/emp_type/Towing');
const Vendor = require('./models/emp_type/Vendor');
const User = require('./models/emp_type/User');

// Import des routes
const authRoutes = require('./routes/AUTH/auth');
const croise = require('./routes/coursRoutes/croisementRoutes');
const auto = require('./routes/coursRoutes/autorouteRoutes');
const vite = require('./routes/coursRoutes/vitesseRoutes');
const dep = require('./routes/coursRoutes/depassementRoutes');
const prio = require('./routes/coursRoutes/prioriteRoutes');
const inter = require('./routes/coursRoutes/intersectionRoutes');
const f = require('./routes/coursRoutes/feuRoutes');
const arr = require('./routes/coursRoutes/arretstatRoutes');
const L = require('./routes/coursRoutes/lightRoutes');
const M = require('./routes/coursRoutes/marquageRoutes');
const T = require('./routes/coursRoutes/tdbRoutes');
const panneauxRoutes = require('./routes/coursRoutes/panneauxRoutes');
const qst = require('./routes/qstRoutes/questionRoutes');
const atmpt=require('./routes/qstRoutes/questionRoutes');
const app = express();
const server = http.createServer(app);
app.set('trust proxy', 1);
//auth 
const cron = require('node-cron');
const axios = require('axios');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Tâche quotidienne à 01h00
cron.schedule('0 1 * * *', async() => {
  console.log("🕛 Cron : Vérification des paiements en cours...");

  try {
      const res = await axios.get('http://localhost:3000/api/admin/verifier-paiements'); // Remplace le port si besoin
      console.log("✅ Cron terminé :", res.data);
  } catch (err) {
      console.error("❌ Erreur lors de l'exécution du cron :", err.message);
  }
});
const PaiementAdminRoutes = require('./routes/Adm_Inc/adminPaiementRoutes');
const paiementUserRoutes = require('./routes/paimenet/paiementUsersRoutes');

app.use('/api/admin', PaiementAdminRoutes);
app.use('/api/paiement', paiementUserRoutes);
app.use('/api/score',atmpt);
//admin

const Admin = require('./models/emp_type/Admin');

const createAdminIfNotExists = async () => {
  try {
      console.log("🔍 EMAIL_USERr =", process.env.EMAIL_USERr); // 🔧 Debug ici

      const existingAdmin = await Admin.findOne({ email: process.env.EMAIL_USERr });

      if (!existingAdmin) {
          const newAdmin = new Admin({
              email: process.env.EMAIL_USERr,
              password: "SuperAdmin123"
          });

          await newAdmin.save();
          console.log("✅ Admin créé avec succès !");
      } else {
          console.log("🔹 Admin déjà existant.");
      }
  } catch (error) {
      console.error("❌ Erreur lors de la création de l'admin :", error);
  }
};


// ✅ Exécuter la création de l'admin avant de démarrer le serveur
createAdminIfNotExists();
// incident route
const incidentR = require('./routes/incidents/IncidentRoutes');
const adminIncidentR = require('./routes/Adm_Inc/adminincidentsRoutes');
const adminUserRoutes = require('./routes/Adm_Inc/adminuserRoutes');
const notif = require('./routes/notif/notifRoutes');

app.use('/api/incidents', incidentR);
app.use('/api/admin/gestionincidentsincidents', adminIncidentR);
app.use('/api/admin/gestionusers', adminUserRoutes);
app.use('/api/notif', notif);
// WebSocket Server

const geolib = require('geolib');

const wss = new WebSocket.Server({ server, path: '/ws' });
const clients = new Map();

const getServiceModel = (serviceType) => {
    switch (serviceType) {
      case 'ميكانيكي': return Mechanic;
      case 'عامل سحب السيارات': return Towing;
      case 'بائع قطع الغيار': return Vendor;
      default:
        console.warn("ServiceType non géré:", serviceType);
        return null;
    }
  };

wss.on('connection', (ws) => {
    console.log('🔗 Nouvelle connexion WebSocket');

    ws.on('message', async (message) => {
      try {
        console.log("📩 Message reçu:", message);
        const data = JSON.parse(message);
        const { providerId, userId, type } = data;

       // ═══════════════════
// 1) Enregistrement
// ═══════════════════
if (type === 'register') {
    if (providerId) {
      clients.set(`provider_${providerId}`, ws);
      console.log(`✅ Provider enregistré: provider_${providerId}`);
      
      // Mise à jour uniquement si le document existe déjà (pas d'upsert)
      await Promise.all([
        Mechanic.findOneAndUpdate(
          { userId: providerId },
          { online: true },
          { new: true } // upsert supprimé
        ),
        Towing.findOneAndUpdate(
          { userId: providerId },
          { online: true },
          { new: true } // upsert supprimé
        ),
        Vendor.findOneAndUpdate(
          { userId: providerId },
          { online: true },
          { new: true } // upsert supprimé
        ),
      ]);
    }
  
    if (userId) {
      clients.set(`user_${userId}`, ws);
      console.log(`✅ Utilisateur enregistré: user_${userId}`);
    }
  
    return;
  }
  

        // Helper pour mise à jour dans le bon modèle
const updateProviderModel = async (providerId, updateData) => {
    const models = [Mechanic, Towing, Vendor];
  
    for (const Model of models) {
      const found = await Model.findOneAndUpdate({ userId: providerId }, updateData, { new: true });
      if (found) return true; // trouvé et mis à jour
    }
  
    console.warn(`⚠️ Aucun modèle trouvé pour providerId ${providerId}`);
    return false;
  };
  
  // ═══════════════════
  // 2) Mise à jour localisation
  // ═══════════════════
  if (type === 'location_update') {
    const { lat, lng } = data;
  
    await updateProviderModel(providerId, {
      currentLocation: { lat, lng },
      lastSeen: new Date()
    });
  
    console.log(`📍 Localisation ${providerId} → lat=${lat}, lng=${lng}`);
  
    // notifier l'utilisateur si une demande est en cours
    const ongoing = await Request.findOne({
      assignedProvider: providerId,
      status: { $in: ["acceptée", "en cours"] }
    });
  
    if (ongoing && clients.has(`user_${ongoing.userId}`)) {
      clients.get(`user_${ongoing.userId}`).send(JSON.stringify({
        type: 'provider_location',
        location: { lat, lng },
        requestId: ongoing._id
      }));
    }
  
    return;
  }
  
  // ═══════════════════
  // 3) Statut online/offline
  // ═══════════════════
  if (type === 'status_update') {
    const { isOnline } = data;
  
    await updateProviderModel(providerId, {
      online: isOnline,
      lastSeen: new Date()
    });
  
    console.log(`🔄 Statut ${providerId} → online=${isOnline}`);
    return;
  }
  

 // ═══════════════════
// 4) Nouvelle demande
// ═══════════════════
if (type === 'new_request') {
  const { serviceType, lat, lng, pieceName, carModel } = data;

  if (!serviceType || !userId) {
    console.log("❌ Requête invalide : serviceType ou userId manquant.");
    return;
  }

  const ServiceModel = getServiceModel(serviceType);
  if (!ServiceModel) {
    console.log(`❌ Modèle introuvable pour le service : ${serviceType}`);
    return;
  }

  const userDetails = await User.findById(userId).select('firstname lastname phone').lean();
  if (!userDetails) {
    console.log(`❌ Utilisateur introuvable avec ID : ${userId}`);
    return;
  }
  userDetails.name = `${userDetails.firstname} ${userDetails.lastname}`;

  // Prépare les données à enregistrer
  const reqData = {
    userId,
    userDetails,
    serviceType,
    location: { lat, lng },
    status: "en attente",
    statusHistory: [{ status: "en attente", changedAt: new Date() }],
    createdAt: new Date()
  };

  if (serviceType === 'بائع قطع الغيار') {
    reqData.pieceName = pieceName;
    reqData.carModel = carModel;
  }

  // Sauvegarde la requête dans tous les cas
  let savedRequest;
  try {
    const newRequest = new Request(reqData);
    savedRequest = await newRequest.save();
    console.log("✅ Demande enregistrée:", savedRequest._id);
  } catch (err) {
    console.error("❌ Erreur lors de l'enregistrement de la demande :", err);
    if (clients.has(`user_${userId}`)) {
      clients.get(`user_${userId}`).send(JSON.stringify({
        type: 'request_creation_failed',
        message: 'Une erreur est survenue lors de la création de la demande.'
      }));
    }
    return;
  }

  // Recherche des prestataires après enregistrement
  const providers = await ServiceModel.find({
    online: true,
    currentLocation: { $exists: true }
  }).limit(20);

  if (!providers.length) {
    console.log(`⚠️ Aucun prestataire en ligne pour le service : ${serviceType}`);
    if (clients.has(`user_${userId}`)) {
      clients.get(`user_${userId}`).send(JSON.stringify({
        type: 'no_providers_available',
        requestId: savedRequest._id
      }));
    } else {
      console.log(`⚠️ Client WebSocket non connecté : user_${userId}`);
    }
    return;
  }

  // Tri des prestataires par distance
  const sorted = providers
    .map(p => ({
      p,
      dist: geolib.getDistance(
        { latitude: lat, longitude: lng },
        { latitude: p.currentLocation.lat, longitude: p.currentLocation.lng }
      )
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 20);

  // Envoi aux prestataires disponibles
  sorted.forEach(({ p }) => {
    const key = `provider_${p.userId}`;
    if (clients.has(key)) {
      const requestPayload = {
        type: 'new_request',
        requestId: savedRequest._id,
        user: userDetails,
        serviceType,
        location: { lat, lng },
        ...(serviceType === 'بائع قطع الغيار' ? { pieceName, carModel } : {}),
        createdAt: savedRequest.createdAt
      };

      console.log(`📤 Envoi à ${key} =>`, JSON.stringify(requestPayload, null, 2));
      clients.get(key).send(JSON.stringify(requestPayload));
    } else {
      console.log(`🚫 WebSocket non trouvé pour ${key}, requête non envoyée.`);
    }
  });

  return;
}


        // ═══════════════════
        // 5) Acceptation (seul le premier)
        // ═══════════════════
        if (type === 'accept_request') {
          const { requestId } = data;
          // ne traite que la 1re acceptation
          const updatedRequest = await Request.findOneAndUpdate(
            { _id: requestId, status: "en attente", assignedProvider: null },
            {
              assignedProvider: providerId,
              status: "acceptée",
              acceptedAt: new Date(),
              $push: { statusHistory: { status: "acceptée", changedAt: new Date() } }
            },
            { new: true }
          );
          if (!updatedRequest) return;

          // prép. data
          const providerDetails = await User.findById(providerId).select('firstname lastname phone').lean();
          const ServiceModel = getServiceModel(updatedRequest.serviceType);
          const providerDoc = await ServiceModel.findOne({ userId: providerId }).lean();

          // notifie l'utilisateur
          const userKey = `user_${updatedRequest.userId}`;
          if (clients.has(userKey)) {
            clients.get(userKey).send(JSON.stringify({
              type: 'request_accepted',
              requestId: updatedRequest._id,
              provider: {
                name: `${providerDetails.firstname} ${providerDetails.lastname}`,
                phone: providerDetails.phone,
                location: providerDoc.currentLocation
              }
            }));
          }
          return;
        }

        // ═══════════════════
        // 6) Annulation (user ou provider)
        // ═══════════════════
        if (type === 'cancel_request') {
          const { requestId, userId, providerId } = data;
          const filter = {
            _id: requestId,
            status: { $in: ["en attente", "acceptée"] }
          };
          if (userId)       filter.userId           = userId;
          else if (providerId) filter.assignedProvider = providerId;

          const upd = await Request.findOneAndUpdate(
            filter,
            {
              status: "annulée",
              cancelledAt: new Date(),
              $push: { statusHistory: { status: "annulée", changedAt: new Date() } }
            },
            { new: true }
          );
          if (!upd) return;

          console.log(`🚫 Demande ${requestId} annulée par ${userId ? 'utilisateur' : 'prestataire'}`);

          // notifier l’autre partie
          if (userId && upd.assignedProvider) {
            const provKey = `provider_${upd.assignedProvider}`;
            clients.has(provKey) && clients.get(provKey).send(JSON.stringify({ type: 'request_cancelled', requestId }));
          }
          else if (providerId && upd.userId) {
            const usrKey = `user_${upd.userId}`;
            clients.has(usrKey) && clients.get(usrKey).send(JSON.stringify({ type: 'request_cancelled', requestId }));
          }
          return;
        }

        // ═══════════════════
        // 7) Fin de service
        // ═══════════════════
        if (type === 'finish_request') {
          const { requestId } = data;
          const req = await Request.findOneAndUpdate(
            { _id: requestId, assignedProvider: providerId },
            {
              status: "terminée",
              completedAt: new Date(),
              $push: { statusHistory: { status: "terminée", changedAt: new Date() } }
            },
            { new: true }
          );
          if (req && clients.has(`user_${req.userId}`)) {
            clients.get(`user_${req.userId}`).send(JSON.stringify({ type: 'request_finished', requestId: req._id }));
          }
          return;
        }

      } catch (err) {
        console.error('❌ Erreur WS:', err);
      }
    });

    // Déconnexion
    ws.on('close', () => {
      for (const [id, sock] of clients.entries()) {
        if (sock === ws) {
          clients.delete(id);
          if (id.startsWith('provider_')) {
            const uid = id.replace('provider_', '');
            Promise.all([
              Mechanic.findOneAndUpdate({ userId: uid }, { online: false, lastSeen: new Date() }),
              Towing.findOneAndUpdate({ userId: uid }, { online: false, lastSeen: new Date() }),
              Vendor.findOneAndUpdate({ userId: uid }, { online: false, lastSeen: new Date() }),
            ]);
          }
          break;
        }
      }
    });
});

  
  
  
  






    




// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

// Limitation du nombre de requêtes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Trop de requêtes, réessayez plus tard"
});
app.use(limiter);

// Logger des requêtes
app.use((req, res, next) => {
    console.log(`📩 [${req.method}] ${req.url} - Body:`, req.body);
    next();
});

// Connexion à MongoDB
const mongoURI = process.env.MONGO_URL || 'mongodb://localhost:27017/monprojetdb';

console.log("🌐 Tentative de connexion à MongoDB...");
console.log("🔗 URI utilisée :", mongoURI);

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("✅ Connexion à MongoDB réussie !");
        console.log("📁 Base de données :", mongoose.connection.name);
        console.log("🗃️ Collections disponibles :", Object.keys(mongoose.connection.collections));
    })
    .catch(err => {
        console.error("❌ Erreur de connexion à MongoDB :", err.message);
        process.exit(1); // Optionnel : arrêter le serveur en cas d'échec
    });

// Route de test
app.get('/', (req, res) => {
    res.send('🚀 Serveur Express opérationnel !');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/panneauxRoutes', panneauxRoutes);
app.use('/api/autoroutes', auto);
app.use('/api/croisements', croise);
app.use('/api/vitesses', vite);
app.use('/api/depassements', dep);
app.use('/api/priorites', prio);
app.use('/api/intersections', inter);
app.use('/api/feux', f);
app.use('/api/arretstats', arr);
app.use('/api/lights', L);
app.use('/api/marquages', M);
app.use('/api/tdbs', T);
app.use('/api/questions', qst);

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
    console.error('❌ Erreur serveur:', err);
    res.status(500).json({ message: '❌ Une erreur interne est survenue.' });
});

// Démarrer le serveur HTTP et WebSocket
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});
