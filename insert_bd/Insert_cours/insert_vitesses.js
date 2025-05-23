require('dotenv').config();
const mongoose = require('mongoose');
const Vitesse = require('./models/vitesse');

// 💜 Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connecté à MongoDB"))
    .catch(err => console.error("❌ Erreur de connexion :", err));
// 💜 Données complètes des autoroutes
const vitesses = [{
    "explication_generale": "و سوف تتعرف من خلال هذا الباب على كيفية احتساب\n\nمسافة زمن رد الفعل\n\nمسافة الوقوف\n\nمسافة الامان\nيجب على السائق أن يكون دائما يقظا ومتحكما في سرعة عربته ، كما يجب أن يعدل من سرعته حسب ما تقتضيه إشارات المرور وحالة الطريق والطقس وكثافة الجولان والعوارض المتوقعة : فالامتثال للعلامات المحددة للسرعة واختيار السرعة التي تتناسب مع حالة المعبد من شأنه المساهمة في الوقاية من حوادث الطرقات",
    "paragraphes": [
       
        { "description": "**السرعة : السبب الأول للوفيات في حوادث الطرقات\n\nللتحكم في عربتك كما يقتضي ذلك قانون الطرقات من الضروري معرفة كيفية تقدير المسافة اللازمة  للوقوف بالعربة في حالة الضرورة القصوى.\n\nماهي مسافة الوقوف" },
        {"description": "**مسافة الوقوف** = المسافة المقطوعة خلال زمن رد الفعل + المسافة المقطوعة بعد كبح الفرامل.\nتختلف هذه المسافة حسب سرعة العربة، التحام الأطواق المطاطية بالمعبد، وزمن رد الفعل.\n\n**ماهو زمن رد الفعل؟**\nزمن رد الفعل هو المدة التي تمتد من بداية معاينة وجود الخطر إلى حين الشروع في الضغط على الفرامل. يمكن أن تتضاعف هذه المدة بسبب التعب أو استهلاك الكحول أو بعض الأدوية، وبالتالي ترتبط هذه المدة بالحالة البدنية أو الذهنية للسائق."},
    
          { "description": "**يمر زمن رد الفعل بالمراحل التالية\n\n    الإدراك حيث تتلقى العين المعلومة وترسلها إلى الدماغ\n    القرار حيث يحلل الدماغ هذه المعلومة ويعطي الإذن لرد الفعل\n    رد الفعل بواسطة الضغط على الفرامل\n\nخلال زمن رد الفعل تستمر العربة في السير بنفس السرعة وتقطع مسافة تسمى مسافة رد الفعل و تساوي هذه المسافة تقريبا ثانية عند الشخص الطبيعي و تكون أكثر إذا كان الشخص غير طبيعي (تعب, حالة سكر, تناول أدوية )." },
        { "description": "**كيف يقع احتساب مسافة زمن رد الفعل\n\n :على معبد جاف \n\nيقع احتساب مسافة الوقوف وذلك بقسمة السرعة على 10 وضرب العدد المتحصل عليه في نفسه ( وهذه قاعدة تقريبية).\n\n- بسرعة 60 كم في الساعة\n\nتكون مسافة الوقوف حوالي 60/10 × 6 = 36 متر\n\n- بسرعة 90 كم في الساعة\n\nتكون مسافة الوقوف حوالي 90/10 × 9 = 81 متر\n\n على معبد مبلل :\n\nيقع احتساب مسافة الوقوف على معبد جاف مع إضافة نصف هذه المسافة :\n\nبسرعة 60كم في الساعة تكون مسافة الوقوف حوالي :\n\n(60/10 × 6) + 18 متر = 54 متر\n\nبسرعة 90 كم في الساعة تكون مسافة الوقوف حوالي ( 90/10 × 9 ) +40 = 120 مترا" },
        { "description": "**مسافة الفرملة\nهي المسافة التي تقطعها العربة بعد كبح الفرامل .\n\n تتأثر هذه المسافة خاصة بالعوامل التالية :\n-    السرعة  \n-    حالة المعبد : أملس أو خشن\n-    حالة الأطواق المطاطية \n-    حالة معدات الفرملة\n\nفي حالة توفر العربة على نظام ABS  \n\nيمكن هذا النظام من تجنب تعطيل دوران العجلات عند الضغط المفاجئ على الفرامل, كما يسمح بالتحكم أكثر في العربة لكن لا يخفض من مسافة الفرملة." },
        { "description": "**مسافة الأمان\n\nمسافة الأمان هي المسافة الكافية  الواجب تركها بين عربتك و العربة التي تسير أمامك  حتى تتمكن من تفادي الاصطدام بها عند التخفيض الفجئي للسرعة أو الوقوف المفاجئ لهذه الأخيرة.\n\n=> ترتبط هذه المسافة بالسرعة\nمسافة الأمان بالنسبة لسائق في حالة عادية تتوفر فيه المؤهلات البد نية والعقلية هي المسافة التي تقطعها العربة في ثانية." },
        { "description": "**السرعة القصوى (رخصة السياقة صنف ب)  \n-    90 كم في الساعة خارج مواطن العمران \n-    110 كم في الساعة في الطريق السيارة\n\nبالنسبة للسائق المتربص : \n    80 كم في الساعة على الطرقات السيارة و خارج مواطن العمران\n\n=> عند تقلص الرؤية بسبب مطر أو ضباب أو غيرها من العوامل الطبيعية، تخفض حدود السرعة ب :\n-    20 كم في الساعة على الطرقات السيارة وخارج مواطن العمران\n-    10 كم في الساعة داخل مواطن العمران." },
        { "description": "**قوة الاصطدام\n\n•    بسرعة 60 كم في الساعة تعادل قوة الاصطدام السقوط العمودي من فوق عمارة بخمس طوابق .\n•    بسرعة 150 كم في الساعة يعادل الاصطدام السقوط العمودي من أعلى بأكثر من 88 متر .\n\n=> وفي حالة الاصطدام بمترجل فإن احتمال وفاته يقدر ب :\n-    10% عند السير بسرعة 20 كم في الساعة\n-    30 % عند السير بسرعة 40 كم في الساعة\n-     و 85% عند السير بسرعة 60 كم في الساعة ويمكن أن يبلغ 100% عند السير بسرعة 80 كلم  في الساعة" },
        { "description": "**حالات التخفيض من السرعة\n\nيجب على كل سائق أن يخفض من سرعته بصفة ملحوظة في الحالات التالية : \n-    إذا كانت ظروف الرؤية غير كافية \n-    في المنعرجات والمنحدرات الحادة وأجزاء الطريق الضيقة أو المكتظة\n-    عند الاقتراب من مفترق الطرقات (رغم تمتعي بالأولوية)\n-    عند الاقتراب من الثكنات ومخارج المعامل \n-    عند مقاطعة أو مجاوزة مجموعة من المترجلين \n-    عند مقاطعة أو مجاوزة حيوانات الجر أو الحمل أو الركوب \n-    عند الاقتراب من عربات النقل العمومي للأشخاص عندما يكون الركاب بصدد الصعود أو النزول \n-    عند الاقتراب من محطات النقل" },
        { "description": "**السرعة تقلص من مجال الرؤيا\n\nيتمتع السائق المتوقف أو الذي يسير بسرعة منخفضة جدا بمجال رؤية يقدر ب 180 درجة.\nوعند السير بسرعة 100 كم في الساعة يتقلص مجال الرؤيا إلى النصف لأن العقل البشري يستطيع فقط معالجة عدد محدود من المعلومات في نفس الوقت.\nفي حين كلما ترتفع سرعة العربة كلما يتلقى العقل البشري أكثر قدر من المعلومات لذلك يجد نفسه مضطرا إلى التخلص من العديد من المعطيات الجانبية.\nوهكذا فالسائق الذي يسير بسرعة كبيرة يمكن أن لا يرى طفلا يستعد لعبور الطريق أو سائقا آخر يستعد لمغادرة تقاطع طريق.\n\nفإذا التزم كل سائق بالمقتضيات المتعلقة بتحديد السرعة، فإن عدد القتلى من حوادث الطرقات سيتقلص من 15 إلى 20 % على الأقل: فهل يمكن أن تتصور عدد الأشخاص الذين يمكن أن تنقذهم في حالة الامتثال لهذه القواعد؟!" }

    ],
    "images":
    [
        "assets/img_184.png",
        "assets/img_185.png",
    ]
}];



Vitesse.insertMany(vitesses)
    .then(() => {
        console.log("✅ Insertion réussie !");
        mongoose.connection.close();
    })
    .catch(err => {
        console.error("❌ Erreur d'insertion :", err);
        mongoose.connection.close();
    });


async function insertvitesse() {
    try {
        await Vitesse.deleteMany();
        await Vitesse.insertMany(vitesses);
        console.log("✅ Tout les paragraphes ont été insérés avec succès !");
        mongoose.connection.close();
    } catch (error) {
        console.error("❌ Erreur lors de l’insertion :", error);
    }
}

insertvitesse();