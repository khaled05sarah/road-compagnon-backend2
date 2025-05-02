require('dotenv').config();
const mongoose = require('mongoose');
const Tdb = require('./models/tdb');

// 💜 Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connecté à MongoDB"))
    .catch(err => console.error("❌ Erreur de connexion :", err));

// 💜 Données complètes des autoroutes
const tdbs = [{
    "explication_generale": "يهدف هذا الباب إلى التعريف بقواعد الأولوية وذلك :\n\n بالمفترقات بعلامات أو بدون علامات\n بالمفترقات المجهزة بأضواء\n بمفترق الطرقات ذات الاتجاه الدوراني",
    "paragraphes": [{
            "description": "مؤشر شحن الحاشدة : يدل على ان شحن الحاشدة قارب على النهاية لذا يجب إعادة شحنها وتغييرها"
        },
        {
            "description": "مؤشر الإعلام بالخطر : له ضوء رفاف يستعمل عند الوقوف الاضطراري وهو اجباري لتنبيه بقية مستعملي الطريق"
        },
        {
            "description": "مؤشر حرارة سائل  التبريد : في  حالة إضاءة هذا المؤشر باللون الأحمر توقف حالا لأنه يعني بأن درجة حرارة المحرك مرتفعة جدا"
        },
        {
            "description": "مؤشر زيت المحرك : .يعني أن مستوى زيت المحرك  منخفض جدا, لذا يجب التوقف وتفقده"
        },
        {
            "description": "يضيء هذا المؤشر عند قرب نفاذ الوقود من الخزان فتسير العربة حينئذ بالكمية الإحتياطية للخزان"
        },
        {
            "description": "محرك الديازل : يضيء هذا المؤشر قبل إشتغال المحرك وينطفئ عندما تتم عملية التسخين لتشغيل المحرك"
        },
       
        {
            "description": "يشير الى انه يتم اذابة الثلخ من النافذة الخلفية"
        },
        {
            "description": "يرسل ضوءا رفافا ويدل على تغيير الإتجاه او المجاوزة"
        },
        {
            "description": "يظهر عند تشغيل أضواء المقاطعة"
        },
        {
            "description": "يعلن عن إشتغال أضواء الطريق"
        },
        {
            "description": "مؤشر أضواء الضباب الأمامية  يستعمل عند وجود ضباب بالطريق"
        },
        {
            "description": "رسوم الطريق"
        }
    ],
    "images":
    [
        "assets/img_231.png",
        "assets/img_232.png",
        "assets/img_233.png",
        "assets/img_234.png",
        "assets/img_235.png",
        "assets/img_236.png",
        "assets/img_237.png",
        "assets/img_238.png",
        "assets/img_239.png",
        "assets/img_240.png",
        "assets/img_241.png"

    ]
}];

Tdb.insertMany(tdbs)
    .then(() => {
        console.log("✅ Insertion réussie !");
        mongoose.connection.close();
    })
    .catch(err => {
        console.error("❌ Erreur d'insertion :", err);
        mongoose.connection.close();
    });

async function insertTdb() {
    try {
        await Tdb.deleteMany();
        await Tdb.insertMany(tdbs);
        console.log("✅ Tous les paragraphes ont été insérés avec succès !");
        mongoose.connection.close();
    } catch (error) {
        console.error("❌ Erreur lors de l’insertion :", error);
    }
}

insertTdb();