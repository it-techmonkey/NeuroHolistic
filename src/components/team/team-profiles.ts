export type TeamProfile = {
  slug: string;
  name: {
    en: string;
    ar: string;
  };
  role: {
    en: string;
    ar: string;
  };
  heroTitle: {
    en: string;
    ar: string;
  };
  shortBio: {
    en: string;
    ar: string;
  };
  paragraphs: {
    en: string[];
    ar: string[];
  };
  image: string;
  testimonials: {
    en: string[];
    ar: string[];
  };
};

export const TEAM_PROFILES: TeamProfile[] = [
  {
    slug: "fawzia-yassmina",
    name: {
      en: "Dr. Fawzia Yassmina",
      ar: "د. فوزية ياسمينة",
    },
    role: {
      en: "Founder of the NeuroHolistic Institute™ and Creator of the NeuroHolistic Method™",
      ar: "مؤسِّسة معهد نيوروهوليستك™ ومبتكرة طريقة نيوروهوليستك™",
    },
    heroTitle: {
      en: "Dr. Fawzia Yassmina",
      ar: "الدكتورة فوزية ياسمينة",
    },
    shortBio: {
      en: "Psychologist, hypnotherapist, and creator of the NeuroHolistic Method™, guiding deep personal transformation through a neuroscience-informed framework.",
      ar: "أخصائية نفسية، ومعالجة بالتنويم الإيحائي، ومبتكرة طريقة نيوروهوليستك™، تقود التحوّل الشخصي العميق من خلال إطار مستند إلى علوم الأعصاب.",
    },
    paragraphs: {
      en: [
        "Dr. Fawzia Yassmina is a psychologist, hypnotherapist, and creator of the NeuroHolistic Method™, a transformational framework designed to restore coherence within the human system and unlock deeper levels of awareness and human potential.",
        "For more than two decades, her work has focused on understanding how the nervous system, cognition, and deeper layers of the psyche interact to shape human experience. Through this exploration, she developed the NeuroHolistic Method™, an integrative approach that brings together insights from neuroscience, psychology, and systemic human development.",
        "Over the past twenty years, Dr. Fawzia has worked with tens of thousands of individuals facing a wide range of life challenges. Her work has supported people navigating emotional and psychological struggles, complex relationship dynamics, health crises, and major life transitions. She has also guided leaders, public figures, and individuals from diverse backgrounds through profound personal transformation.",
        "Today, she leads the NeuroHolistic Institute™, guiding individuals through deep personal transformation while training practitioners and advancing research into the science of human change.",
      ],
      ar: [
        "الدكتورة فوزية ياسمينة أخصائية نفسية، ومعالجة بالتنويم الإيحائي، ومبتكرة طريقة نيوروهوليستك™، وهي إطار تحوّلي صُمّم لاستعادة الاتساق داخل المنظومة الإنسانية وإطلاق مستويات أعمق من الوعي والإمكانات البشرية.",
        "على مدى أكثر من عقدين، انصبّ عملها على فهم الكيفية التي يتفاعل بها الجهاز العصبي، والإدراك، والطبقات الأعمق من النفس في تشكيل التجربة الإنسانية. ومن خلال هذا الاستكشاف، طوّرت طريقة نيوروهوليستك™، وهي مقاربة تكاملية تجمع بين رؤى من علوم الأعصاب، وعلم النفس، والتطوّر الإنساني المنظومي.",
        "وخلال السنوات العشرين الماضية، عملت الدكتورة فوزية مع عشرات الآلاف من الأفراد الذين واجهوا طيفاً واسعاً من تحديات الحياة. وقد دعم عملها أشخاصاً يمرّون بصعوبات عاطفية ونفسية، وتعقيدات في العلاقات، وأزمات صحية، وتحولات كبرى في الحياة. كما رافقت قادة، وشخصيات عامة، وأفرادًا من خلفيات متنوعة في مسارات تحوّل شخصي عميق.",
        "واليوم، تقود معهد نيوروهوليستك™، حيث ترافق الأفراد في رحلات تحوّل شخصي عميق، وتدرّب الممارسين، وتسهم في تطوير البحث في علم التغيّر الإنساني.",
      ],
    },
    image: "/images/team/Fawzia Yassmina Landing.png",
    testimonials: {
      en: [
        "Working with Dr. Fawzia helped me reconnect with emotional clarity and long-term inner stability.",
        "Her depth, precision, and presence made a profound difference in how I understand myself and my life direction.",
      ],
      ar: [
        "العمل مع الدكتورة فوزية ساعدني على إعادة الاتصال بوضوحي العاطفي واستقراري الداخلي على المدى الطويل.",
        "عمقها ودقتها وحضورها أحدثا فرقاً عميقاً في طريقة فهمي لنفسي واتجاه حياتي.",
      ],
    },
  },
  {
    slug: "mariam-al-kaisi",
    name: {
      en: "Mariam Al Kaissi",
      ar: "مريم القيسي",
    },
    role: {
      en: "NeuroHolistic Certified",
      ar: "ممارِسة معتمدة في نيوروهوليستك",
    },
    heroTitle: {
      en: "Mariam Al Kaissi",
      ar: "مريم القيسي، ممارِسة معتمدة في نيوروهوليستك",
    },
    shortBio: {
      en: "A grounded practitioner known for calm presence, deep attentiveness, and a clear, structured approach to transformation.",
      ar: "تجلب مريم إلى فريق نيوروهوليستك حضورًا هادئاً ومُرسِياً للتوازن. فإحساسها الطبيعي بالاتزان والانتباه يهيّئ مساحة يستطيع فيها الأفراد أن يهدؤوا، ويعيدوا الاتصال بأنفسهم، ويشعروا بالدعم في مسار تحوّلهم.",
    },
    paragraphs: {
      en: [
        "Mariam brings a calm and grounding presence to the NeuroHolistic team. Her natural sense of balance and attentiveness create a space where individuals can slow down, reconnect with themselves, and feel supported in their process of transformation.",
        "Following the Beirut explosion, she experienced a profound personal turning point that led her to explore a deeper path beyond her professional career. Her long-standing interest in psychology, human behavior, and healing gradually guided her toward the field of wellness and personal transformation.",
        "Through the NeuroHolistic Method™, Mariam found the structured depth she had long been searching for, a way to work with the human system at its deeper layers, restoring coherence and enabling genuine transformation. She is now a certified NeuroHolistic Practitioner, supporting individuals with clarity, presence, and deep commitment to meaningful change.",
      ],
      ar: [
        "تجلب مريم إلى فريق نيوروهوليستك حضورًا هادئاً ومُرسِياً للتوازن. فإحساسها الطبيعي بالاتزان والانتباه يهيّئ مساحة يستطيع فيها الأفراد أن يهدؤوا، ويعيدوا الاتصال بأنفسهم، ويشعروا بالدعم في مسار تحوّلهم.",
        "بعد انفجار بيروت، عاشت نقطة تحوّل شخصية عميقة دفعتها إلى استكشاف مسار أعمق يتجاوز حياتها المهنية. وقد قادها اهتمامها الطويل بعلم النفس، والسلوك الإنساني، والشفاء تدريجيًا إلى مجال العافية والتحوّل الشخصي.",
        "ومن خلال طريقة نيوروهوليستك™، وجدت مريم العمق المنظّم الذي كانت تبحث عنه طويلًا، طريقةً للعمل مع المنظومة الإنسانية في طبقاتها الأعمق، بما يعيد الاتساق ويفسح المجال لتحوّل حقيقي. وهي اليوم ممارِسة معتمدة في نيوروهوليستك، تدعم الأفراد بوضوح، وحضور، والتزام عميق بالتغيير الحقيقي.",
      ],
    },
    image: "/images/team/Mariam%20Al%20Kaissi.png",
    testimonials: {
      en: [
        "Mariam created a space where I felt safe, focused, and genuinely supported throughout my process.",
        "Her calm guidance helped me move from overwhelm to a clearer, more balanced inner state.",
      ],
      ar: [
        "أبدعت مريم فضاءً شعرت فيه بالأمان والتركيز والدعم الحقيقي طوال رحلتي.",
        "ساعدني هدوء توجيهها على الانتقال من الإرهاق إلى حالة داخلية أوضح وأكثر توازناً.",
      ],
    },
  },
  {
    slug: "noura-youssef",
    name: {
      en: "Noura Youssef",
      ar: "نورا يوسف",
    },
    role: {
      en: "NeuroHolistic Certified",
      ar: "ممارِسة معتمدة في نيوروهوليستك",
    },
    heroTitle: {
      en: "Noura Youssef",
      ar: "نورا يوسف، ممارِسة معتمدة في نيوروهوليستك",
    },
    shortBio: {
      en: "A compassionate practitioner integrating scientific insight with intuition, warmth, and deep human care.",
      ar: "ممارسة نيوروهوليستك تدمج الفهم العلمي مع الحدس والدفء والرعاية الإنسانية العميقة.",
    },
    paragraphs: {
      en: [
        "Noura brings a deeply intuitive and compassionate presence to the NeuroHolistic team. Her natural warmth and ability to connect with others create a space where individuals feel genuinely supported and understood.",
        "Originally from Syria and trained in Pharmacy, Noura has long been interested in the relationship between health, emotions, and human well-being. Her curiosity about the deeper dimensions of healing led her to explore the NeuroHolistic Method™.",
        "Through her training in NeuroHolistic studies, Noura found an approach that integrates her scientific background with her natural intuition and care for others. She is now a certified NeuroHolistic Practitioner, supporting individuals in reconnecting with themselves and cultivating a healthier, more balanced life.",
      ],
      ar: [
        "تجلب نورا إلى فريق نيوروهوليستك حضوراً حدسياً وعطوفاً. فدفئها الطبيعي وقدرتها على التواصل مع الآخرين تخلق فضاءً يشعر فيه الأفراد بالدعم والفهم الحقيقي.",
        "من أصل سوري ومتدرّبة في الصيدلة، كانت نورا منذ فترة طويلة مهتمة بالعلاقة بين الصحة، والعواطف، والرفاه الإنساني. وقد قاد فضولها حول أبعاد الشفاء الأعمق إلى استكشاف طريقة نيوروهوليستك™.",
        "ومن خلال تدريبها في دراسات نيوروهوليستك، وجدت نورا نهجاً يدمج خلفيتها العلمية مع حدسها الطبيعي وعنايتها بالآخرين. وهي الآن ممارِسة معتمدة في نيوروهوليستك، تدعم الأفراد في إعادة الاتصال بأنفسهم وتنمية حياة أكثر صحة وتوازناً.",
      ],
    },
    image: "/images/team/Noura Yousef.png",
    testimonials: {
      en: [
        "Noura's warmth and clarity helped me feel seen while building healthier emotional patterns.",
        "I appreciated how she blended scientific understanding with genuine compassion in every session.",
      ],
      ar: [
        "ساعدني دفء نورا ووضوحها على الشعور بأنني مرئية أثناء بناء أنماط عاطفية أكثر صحة.",
        "قدّرت كيف دمجت الفهم العلمي بالعطف الحقيقي في كل جلسة.",
      ],
    },
  },
  {
    slug: "zekra-khayata",
    name: {
      en: "Zekra Khayata",
      ar: "ذكرى خياطة",
    },
    role: {
      en: "NeuroHolistic Certified",
      ar: "ممارِسة معتمدة في نيوروهوليستك",
    },
    heroTitle: {
      en: "Zekra Khayata",
      ar: "ذكرى خياطة، ممارِسة معتمدة في نيوروهوليستك",
    },
    shortBio: {
      en: "A nurturing and compassionate practitioner focused on restoring internal balance through awareness and insight.",
      ar: "ممارسة نيوروهوليستك حاضنة وحنونة تركّز على استعادة التوازن الداخلي من خلال الوعي والبصيرة.",
    },
    paragraphs: {
      en: [
        "Zekra brings a deeply compassionate and nurturing presence to the NeuroHolistic team. Her natural warmth and attentive listening create a sense of safety and understanding that allows individuals to feel supported as they explore their inner world.",
        "Originally from Syria, Zekra is a certified NeuroHolistic Practitioner dedicated to understanding the connection between the brain, emotions, and human transformation. Her work focuses on helping individuals recognize the subconscious patterns that shape their experiences, decisions, and overall well-being.",
        "Through the NeuroHolistic Method™, she supports people in developing deeper awareness, restoring internal balance, and creating meaningful personal change.",
      ],
      ar: [
        "تجلب ذكرى إلى فريق نيوروهوليستك حضوراً عطوفاً وراعياً. فدفئها الطبيعي واستماعها المتيقظ يخلقان إحساساً بالأمان والفهم يسمح للأفراد بالشعور بالدعم أثناء استكشاف عوالمهم الداخلية.",
        "من أصل سوري، ذكرى هي ممارِسة معتمدة في نيوروهوليستك مكرسة لفهم العلاقة بين الدماغ، والعواطف، والتحوّل الإنساني. يركّز عملها على مساعدة الأفراد على التعرّف إلى الأنماط اللاواعية التي تشكّل تجاربهم وقراراتهم ورفاههم العام.",
        "ومن خلال طريقة نيوروهوليستك™، تدعم الناس في تطوير وعي أعمق، واستعادة التوازن الداخلي، وإحداث تغيير شخصي ذي معنى.",
      ],
    },
    image: "/images/team/Zekra Khayata.png",
    testimonials: {
      en: [
        "Zekra's listening and gentle guidance helped me feel safe enough to do real inner work.",
        "Her sessions gave me practical insight into patterns I had struggled with for years.",
      ],
      ar: [
        "ساعدني استماع ذكرى وتوجيهها اللطيف على الشعور بالأمان الكافي للقيام بعمل داخلي حقيقي.",
        "منحتني جلساتها بصيرة عملية حول الأنماط التي كافحت معها لسنوات.",
      ],
    },
  },
  {
    slug: "reem-mobayed",
    name: {
      en: "Reem Mobayed",
      ar: "ريم مبيّض",
    },
    role: {
      en: "NeuroHolistic Certified",
      ar: "ممارِسة معتمدة في نيوروهوليستك",
    },
    heroTitle: {
      en: "Reem Mobayed",
      ar: "ريم مبيّض، ممارِسة معتمدة في نيوروهوليستك",
    },
    shortBio: {
      en: "A Syrian-Canadian practitioner and mental wellness advocate known for engaging, insight-driven transformational work.",
      ar: "ممارسة نيوروهوليستك ومدافعة عن الصحة النفسية، معروفة بعملها التحوّلي الجاذب والقائم على البصيرة.",
    },
    paragraphs: {
      en: [
        "Reem is a Syrian-Canadian certified NeuroHolistic Practitioner, mental wellness advocate, and public voice for emotional well-being. Known for her genuine and engaging presence, she brings both insight and energy to the NeuroHolistic team.",
        "Her work focuses on exploring the deep connection between the mind, brain, and emotional healing. Drawing on neuroscience, psychology, and holistic therapeutic approaches, she helps individuals recognize the subconscious patterns that shape their emotions, behaviors, and sense of self.",
        "Through a compassionate and insight-driven approach, Reem guides people toward greater self-awareness, nervous system balance, and inner clarity, supporting meaningful and lasting personal transformation.",
      ],
      ar: [
        "ريم هي ممارِسة معتمدة في نيوروهوليستك سورية-كندية، ومدافعة عن العافية النفسية، وصوت عام للرفاه العاطفي. معروفة بحضورها الحقيقي والجاذب، تجلب البصيرة والطاقة إلى فريق نيوروهوليستك.",
        "يركّز عملها على استكشاف العلاقة العميقة بين العقل، والدماغ، والشفاء العاطفي. مستنيرةً بعلوم الأعصاب، وعلم النفس، والمقاربات العلاجية الشاملة، تساعد الأفراد على التعرّف إلى الأنماط اللاواعية التي تشكّل عواطفهم وسلوكياتهم وإحساسهم بذواتهم.",
        "ومن خلال نهج عطوف يقوده البصيرة، توجّه ريم الناس نحو وعي ذاتي أكبر، وتوازن في الجهاز العصبي، ووضوح داخلي، مما يدعم تحوّلاً شخصياً ذا معنى ودائماً.",
      ],
    },
    image: "/images/team/Reem%20Mbayed.PNG",
    testimonials: {
      en: [
        "Reem combines depth and practicality in a way that helped me make lasting changes.",
        "Her energy and insight gave me confidence to move through difficult transitions with clarity.",
      ],
      ar: [
        "تجمع ريم بين العمق والعملية بطريقة ساعدتني على إحداث تغييرات دائمة.",
        "منحتني طاقتها وبصيرتها الثقة للعبور من انتقالات صعبة بوضوح.",
      ],
    },
  },
  {
    slug: "fawares-azaar",
    name: {
      en: "Fawares Azaar",
      ar: "فوارس عازار",
    },
    role: {
      en: "NeuroHolistic Certified",
      ar: "ممارِسة معتمدة في نيوروهوليستك",
    },
    heroTitle: {
      en: "Fawares Azaar",
      ar: "فوارس عازار، ممارِسة معتمدة في نيوروهوليستك",
    },
    shortBio: {
      en: "A confident and intuitive practitioner blending medical consulting experience with emotional intelligence and care.",
      ar: "ممارسة نيوروهوليستك واثقة وحدسية تمزج بين خبرة الاستشارات الطبية والذكاء العاطفي والرعاية.",
    },
    paragraphs: {
      en: [
        "Fawares brings a vibrant, confident, and intuitive presence to the NeuroHolistic team. Known for her warm and engaging personality, she creates an atmosphere where individuals feel both understood and encouraged to move forward in their process of transformation.",
        "Originally from Lebanon and now based in Dubai, Fawares grew up as the only sister among six brothers, an environment that naturally shaped her independence, resilience, and strong sense of leadership. She has built a successful career as a consultant in the medical field, where her work deepened her understanding of the relationship between physical health, emotional wellbeing, and human behavior.",
        "She is now a certified NeuroHolistic Practitioner, integrating her professional experience, emotional intelligence, and natural intuition to support individuals in developing greater awareness, balance, and meaningful change in their lives.",
      ],
      ar: [
        "تجلب فوارس إلى فريق نيوروهوليستك حضوراً نابضاً وواثقاً وحدسياً. معروفة بشخصيتها الدافئة والجاذبة، تخلق أجواءً يشعر فيها الأفراد بالفهم والتشجيع على التقدم في عملية تحوّلهم.",
        "من أصل لبناني ومقيمة الآن في دبي، نشأت فوارس كالأخت الوحيدة بين ستة إخوة، بيئة شكّلت طبيعياً استقلالها ومرونتها وإحساسها القيادي القوي. وقد بنت مسيرة مهنية ناجحة كمستشارة في المجال الطبي، حيث عمّق عملها فهمها للعلاقة بين الصحة الجسدية والرفاه العاطفي والسلوك الإنساني.",
        "وهي الآن ممارِسة معتمدة في نيوروهوليستك، تدمج خبرتها المهنية وذكاءها العاطفي وحدسها الطبيعي لدعم الأفراد في تطوير وعي أكبر، وتوازن، وتغيير ذي معنى في حياتهم.",
      ],
    },
    image: "/images/team/Fawares Azaar.png",
    testimonials: {
      en: [
        "Fawares brought both clarity and encouragement, helping me take meaningful action in my life.",
        "I felt supported and challenged in the right way, with steady guidance throughout my journey.",
      ],
      ar: [
        "جلبت فوارس الوضوح والتشجيع معاً، مما ساعدني على اتخاذ إجراءات ذات معنى في حياتي.",
        "شعرت بالدعم والتحدي بالطريقة الصحيحة، مع توجيه ثابت طوال رحلتي.",
      ],
    },
  },
  {
    slug: "joud-charafeddin",
    name: {
      en: "Joud Charafeddin",
      ar: "جود شرف الدين",
    },
    role: {
      en: "NeuroHolistic Certified",
      ar: "ممارِس معتمد في نيوروهوليستك",
    },
    heroTitle: {
      en: "Joud Charafeddin",
      ar: "جود شرف الدين، ممارِس معتمد في نيوروهوليستك",
    },
    shortBio: {
      en: "A grounded and intuitive practitioner creating safe spaces for healing, awareness, and inner harmony.",
      ar: "ممارس نيوروهوليستك متزن يتميز بحدسه، يهيّئ مساحات آمنة للشفاء والوعي والانسجام الداخلي.",
    },
    paragraphs: {
      en: [
        "Joud brings a deeply grounded and intuitive presence to the NeuroHolistic team. With a natural sensitivity to people and a strong connection to the rhythms of nature, he creates a space where individuals feel safe, understood, and supported in their healing journey.",
        "Lebanese and based in Lebanon, Joud is a certified NeuroHolistic Practitioner whose work is guided by compassion, intuition, and a sincere dedication to helping others reconnect with their inner balance.",
        "Known for his calm strength and authentic presence, he supports individuals in exploring deeper layers of awareness and restoring harmony within themselves.",
      ],
      ar: [
        "يجلب جود إلى فريق نيوروهوليستك حضوراً مرسّخاً بعمق وحدسياً. بحساسية طبيعية تجاه الناس وارتباط قوي بإيقاعات الطبيعة، يخلق فضاءً يشعر فيه الأفراد بالأمان والفهم والدعم في رحلتهم للشفاء.",
        "لبناني ومقيم في لبنان، جود هو ممارِس معتمد في نيوروهوليستك يقود عمله التعاطف والحدس والتفاني الصادق في مساعدة الآخرين على إعادة الاتصال بتوازنهم الداخلي.",
        "معروف بقوة هدوئه وحضوره الحقيقي، يدعم الأفراد في استكشاف طبقات أعمق من الوعي واستعادة الانسجام داخل أنفسهم.",
      ],
    },
    image: "/images/team/Joud.png",
    testimonials: {
      en: [
        "Joud's calm presence helped me slow down, listen deeply, and reconnect with myself.",
        "His grounded style created trust and helped me regain a stronger sense of inner balance.",
      ],
      ar: [
        "ساعدني هدوء حضور جود على التباطؤ والاستماع بعمق وإعادة الاتصال بذاتي.",
        "خلق أسلوبه المرسّخ الثقة وساعدني على استعادة إحساس أقوى بالتوازن الداخلي.",
      ],
    },
  },
];

export const TEAM_PROFILE_MAP = new Map(
  TEAM_PROFILES.map((profile) => [profile.slug, profile])
);
