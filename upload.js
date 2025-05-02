const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Vérifier si le dossier 'uploads/' existe, sinon le créer
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Définir le stockage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Dossier où les fichiers seront stockés
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Renommer le fichier
    }
});

// Filtrer les fichiers pour n'accepter que PNG, JPG, JPEG et PDF
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf','application/octet-stream'];
    
    // 🔍 Debug log du type MIME reçu
    console.log(`🧪 Fichier reçu: ${file.originalname}, Type MIME: ${file.mimetype}`);
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        console.warn(`⛔ Type non autorisé: ${file.mimetype}`);
        cb(new Error(`Seuls les fichiers PNG, JPG, JPEG et PDF sont autorisés. Type reçu : ${file.mimetype}`), false);
    }
};

// Créer l'instance multer
const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter 
});

module.exports = upload;
