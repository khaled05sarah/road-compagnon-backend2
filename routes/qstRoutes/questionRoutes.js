const express = require('express');
const router = express.Router();
const Question = require('../../models/test/question');
const Attempt = require('../../models/test/attempt');
router.get('/random', async (req, res) => {
    try {
        const questions = await Question.aggregate([{ $sample: { size: 40 } }]);
        
        console.log("📌 Questions envoyées :", questions); // ✅ Affiche les questions dans la console
        
        res.status(200).json(questions);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des questions :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
});

// POST /api/attempts
router.post('/attempts', async (req, res) => {
    try {
      const { userId, score } = req.body;
  
      const newAttempt = new Attempt({
        userId,
        score
      });
  
      await newAttempt.save();
      res.status(201).json({ success: true, message: 'Tentative enregistrée', attempt: newAttempt });
    } catch (error) {
      console.error('Erreur POST attempt:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la création de la tentative' });
    }
  });
// GET /api/attempts
router.get('/attempts/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const attempts = await Attempt.find({ userId });

        res.status(200).json(attempts);
    } catch (err) {
        console.error('Erreur lors de la récupération des tentatives :', err);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des tentatives.' });
    }
});
    

module.exports = router;

