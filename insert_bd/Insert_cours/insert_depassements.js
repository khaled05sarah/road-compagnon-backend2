require('dotenv').config();
const mongoose = require('mongoose');
const Depassement = require('./models/depassement');

// 💜 Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connecté à MongoDB"))
    .catch(err => console.error("❌ Erreur de connexion :", err));
// 💜 Données complètes des autoroutes
const depassements = [{
    "explication_generale": "كما هو الشأن عند الاقتراب من مفترق طرقات ، يجب على السائق مضاعفة الانتباه والحذر عند القيام بعملية المجاوزة، فالمجاوزة التي تشكل خطرا على الجولان يمكن أن تؤدي إلى حادث مرور لذلك يجب اتخاذ الاحتياطات اللازمة عند الشروع في هذه المناورة لإنهائها بكل أمان. وسوف تتعرف من خلال هذا الباب على كيفية القيام بعملية المجاوزة والحالات التي تمنع فيها المجاوزة.",
    "paragraphes": [{
            "description": "يجب على كل سائق يريد القيام بعملية المجاوزة أن يتأكد من قدرته على القيام بذلك دون خطر.\n\nالمبدأ العام\nتكون عملية المجاوزة على اليسار."
        },
        {
            "description": "استثناء\n\nيمكن المجاوزة على اليمين إذا شرع سائق العربة السابقة في الانعطاف نحو اليسار وأعلن عن ذلك بواسطة إشارات تغيير الاتجاه.\n\nيمكنني مجاوزة هذه السيارة ذات اللون الأسود من جهة اليمين بعد أن أعرب صاحبها عن نيته الانعطاف إلى اليسار بتشغيله أضواء تغيير الاتجاه من جهة اليسار."
        },
        {
            "description": "كيف يمكن القيام بالمجاوزة\n\nيجب على كل سائق يريد القيام بعملية مجاوزة أن يتأكد من قدرته على القيام بذلك بدون خطر وعليه خاصة أخذ الاحتياطات التالية :\n\nقبل المجاوزة\n\n- أن يتأكد من عدم وجود حالة من حالات منع المجاوزة أي غياب علامات عمودية وسطحية تمنع المجاوزة.\n- كما يجب أن يأخذ في الاعتبار عرض المعبد وشكله والعوامل الطبيعية مثل الضباب والمطر والرياح الجانبية.\n- أن يتأكد من أن السبيل شاغر على مسافة كافية تمكن من القيام بهذه العملية بدون خطر.\n- أن يتأكد أن السائق المتقدم عليه والسائق الذي يتبعه لم يشرعا في أي عمل من أعمال المجاوزة.\n- أن يتأكد من إمكانية الرجوع إلى السبيل العادي للجولان بدون خطر.\n- الإعلان عن القيام بعملية المجاوزة وذلك بتشغيل أضواء تغيير الاتجاه."
        },
        {
            "description": "في هذه الحالة كل الظروف متوفرة للقيام بعملية المجاوزة: الخط المتقطع بوسط المعبد يسمح بالمجاوزة.\nالرؤية من الأمام واضحة.\nلا وجود لعربة أخرى بصدد القيام بعملية مجاوزة.\nيمكنني إذا الشروع في عملية المجاوزة بعد تشغيل أضواء تغيير الاتجاه.\n\n**أثناء وبعد المجاوزة**\n- أن يترك مسافة جانبية كافية مع الزيادة في السرعة.\n- من الأفضل أن لا يقل فارق السرعة عن 20 كم في الساعة حتى تتم هذه المناورة في وقت قصير.\n- إذا ظهرت العربة التي وقع تجاوزها في المرآة العاكسة للرؤيا الداخلية تبدأ عملية الرجوع إلى الصف الأصلي بكل أمان وذلك بتشغيل أضواء تغيير الاتجاه من الجهة اليمنى.\n- يجب على كل سائق يراد تجاوزه أن ينحاز إلى أقصى اليمين ولا يزيد في سرعته.\n\n**حالات منع المجاوزة**\nتحجر مجاوزة العربات غير الدراجات والدراجات النارية ذات العجلتين:\n- عند الاقتراب من قمم المرتفعات.\n- بالمنعرجات.\n- عند المرور على الجسور الضيقة التي لا تشتمل على أكثر من سبيلين.\n- في جميع الحالات التي تحجر فيها المجاوزة بواسطة علامات أو رسوم الطريق.\n- في تقاطع الطرقات مع السكك الحديدية غير المجهزة بحواجز أو نصف حواجز.\n- في تقاطع الطرقات إلا بالنسبة إلى السائقين الذين يسيرون في سبل ذات أولوية ومشار إليها بعلامات.\n\n**مثال 1**\n\nبداية من هذه العلامة تمنع المجاوزة على كل العربات ذات المحرك باستثناء العربات ذات العجلتين."
          },
        {
            "description": "مثال 2\n\nيمنع الخط المتواصل كل مجاوزة أو اجتيازه من طرف كل سائق. كما تُمنع المجاوزة عندما تكون هناك سيارة خلفية بصدد تجاوز السائق."
          }
          
    ],
    "images":
    [
        
        "assets/img_186.png",
        "assets/img_187.png",
        
        "assets/img_188.png",
        "assets/img_189.png",
        
        "assets/img_190.png",
        "assets/img_191.png"
    ]
}];



Depassement.insertMany(depassements)
    .then(() => {
        console.log("✅ Insertion réussie !");
        mongoose.connection.close();
    })
    .catch(err => {
        console.error("❌ Erreur d'insertion :", err);
        mongoose.connection.close();
    });


async function insertdepassement() {
    try {
        await Depassement.deleteMany();
        await Depassement.insertMany(depassements);
        console.log("✅ Tout les paragraphes ont été insérés avec succès !");
        mongoose.connection.close();
    } catch (error) {
        console.error("❌ Erreur lors de l’insertion :", error);
    }
}

insertdepassement();