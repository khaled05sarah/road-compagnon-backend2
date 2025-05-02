const mongoose = require('mongoose');

const autorouteSchema = new mongoose.Schema({
    explication_generale: { type: String, required: true },
    paragraphes: [{
        _id: false,
        description: { type: String, required: true }
    }],
   images: [{ type: String }]  
}, { timestamps: true });

const Autoroute = mongoose.model('Autoroute', autorouteSchema);
module.exports = Autoroute;