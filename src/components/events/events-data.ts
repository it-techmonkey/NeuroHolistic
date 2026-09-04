import type { EventItem } from "./types";

export const MOCK_EVENTS: EventItem[] = [
  {
    id: "5",
    typeKey: "online",
    filterPeriod: "2026-10",
    image: "/images/events/quantum-leap-2026.jpeg",
    slug: "neuroholistic-consciousness-quantum-leap",
    isPaid: true,
    hostTherapistEmail: "fawzia.yassmina@neuroholisticinstitute.com",
    showOnAcademyPage: true,
    liveSessions: [
      {
        key: "liberation-1",
        title: { en: "Part I — Liberation (Session 1)", ar: "الجزء الأول — التحرر (الجلسة 1)" },
        startsAt: "2026-10-09T18:00:00",
        endsAt: "2026-10-09T22:00:00",
      },
      {
        key: "liberation-2",
        title: { en: "Part I — Liberation (Session 2)", ar: "الجزء الأول — التحرر (الجلسة 2)" },
        startsAt: "2026-10-10T18:00:00",
        endsAt: "2026-10-10T22:00:00",
      },
      {
        key: "elevation-1",
        title: { en: "Part II — Elevation (Session 1)", ar: "الجزء الثاني — الارتقاء (الجلسة 1)" },
        startsAt: "2026-10-23T18:00:00",
        endsAt: "2026-10-23T22:00:00",
      },
      {
        key: "elevation-2",
        title: { en: "Part II — Elevation (Session 2)", ar: "الجزء الثاني — الارتقاء (الجلسة 2)" },
        startsAt: "2026-10-24T18:00:00",
        endsAt: "2026-10-24T22:00:00",
      },
      {
        key: "integration",
        title: { en: "Integration & Embodiment", ar: "الدمج والتجسيد" },
        startsAt: "2026-10-31T18:00:00",
        endsAt: "2026-10-31T22:00:00",
      },
    ],
    locales: {
      en: {
        title: "NeuroHolistic Consciousness Quantum Leap™",
        subtitle: "A Live Online Immersive Journey Into Expanded Consciousness",
        cardDescription:
          "A live online immersive journey — 20 hours across five sessions plus a guided integration period — designed to take you beyond automatic emotional patterns and change the level of consciousness from which you experience life.",
        hook:
          "Imagine... You are at peace. You are truly free. You consciously create your life. That is not a dream. It is life from a different level of consciousness.",
        description:
          "Most people spend their lives trying to change their circumstances while remaining unaware of the emotional patterns, conditioning, automatic responses, and perceptions silently influencing their thoughts, decisions, relationships, and experience of life.\n\nNeuroHolistic Consciousness Quantum Leap™ is an immersive transformational experience designed to take you beyond those automatic patterns and into a fundamentally different way of experiencing yourself, others, and life.\n\nBuilt upon the NeuroHolistic Method™, the experience brings together psychology, neuroscience-informed principles, subconscious exploration, somatic awareness, emotional processing, and consciousness development within one structured transformational journey.\n\nThe intention is to change the level from which you experience life.",
        schedule: {
          heading: "The Journey",
          intro:
            "The experience unfolds through two live Liberation sessions, followed by a guided integration journey with daily reminders and practices, then two live Elevation sessions, and a final Integration & Embodiment session.",
          columns: { part: "Part", description: "Description", date: "Date" },
          rows: [
            {
              part: "Part 1 — Liberation",
              description: "2 successive live sessions",
              date: "October 9 & 10 · 6:00 PM to 10:00 PM",
            },
            {
              part: "Guided Integration",
              description:
                "You join the private participant community and receive guidance, awareness prompts, and NeuroHolistic practices",
              date: "October 11 to 22",
            },
            {
              part: "Part 2 — Elevation",
              description: "2 successive live sessions",
              date: "October 23 & 24 · 6:00 PM to 10:00 PM",
            },
            {
              part: "Integration & Embodiment",
              description: "1 live session",
              date: "October 31 · 6:00 PM to 10:00 PM",
            },
          ],
        },
        sections: [
          {
            heading: "1. Part I — Liberation",
            intro: "October 9 & 10, 2026 · 6:00 PM to 10:00 PM · 8 hours live online",
            items: [
              "Across two intensive live sessions, you will explore the emotional patterns, conditioning, subconscious responses, and automatic states that can keep you operating from contracted levels of consciousness.",
              "Through the NeuroHolistic transformational process, you will be guided through: Awareness → Acknowledgement → Identification → Allowing → Processing → Elevation.",
              "We journey through emotional states such as shame, guilt, fear, anger, and other patterns of emotional survival, progressively opening toward courage, acceptance, and Love.",
              "Love becomes the bridge. Because before consciousness can expand, we first create space beyond what has been unconsciously controlling us.",
            ],
          },
          {
            heading: "2. The Guided Integration Journey",
            intro:
              "October 11 to 22, 2026. The live experience continues into everyday life. This part of the journey requires 15 minutes a day with simple integration practices.",
            items: [
              "During the period between the two intensive weekends, you will become part of a private participant community and receive guidance, awareness prompts, and NeuroHolistic practices designed to help you observe what is happening within you as you move through your normal life.",
              "Rather than treating integration as homework, these practices invite you to become increasingly conscious of your emotional responses, body, thoughts, perceptions, relationships, choices, and automatic patterns.",
              "The integration journey will include two progressive practices, supported by short daily prompts and reminders.",
              "Because awareness becomes powerful when it moves beyond the session and enters everyday life.",
            ],
          },
          {
            heading: "3. Part II — Elevation",
            intro: "October 23 & 24, 2026 · 6:00 PM to 10:00 PM · 8 hours live online",
            items: [
              "Once space has been created, the journey moves from liberation into expansion.",
              "These two intensive sessions explore progressively expanded states of awareness and the possibility of experiencing yourself and life beyond habitual conditioning and automatic perception.",
              "We move beyond Love toward the higher layers of the NeuroHolistic consciousness framework, exploring expanded awareness, peace, conscious creation, alignment, and what we describe within the framework as enlightenment.",
              "The focus gradually shifts from “What am I trying to become free from?” to “From what level of consciousness do I choose to live?”",
            ],
          },
          {
            heading: "4. Integration & Embodiment",
            intro: "October 31, 2026 · Final live integration session",
            items: [
              "One week after the intensive, we come together again.",
              "This final session creates space to reflect on what has changed, explore what emerged as you returned to everyday life, ask questions, integrate insights, and support the embodiment of the work beyond the event itself.",
              "The objective is not to leave you with a temporary peak experience. It is to help you bring greater awareness into how you actually live.",
            ],
          },
          {
            heading: "The Complete Experience",
            items: [
              "20 live hours.",
              "4 × 4-hour intensive live sessions.",
              "1 final 4-hour Integration & Embodiment session.",
              "Guided Integration Journey.",
              "Daily awareness prompts & practices.",
              "Private participant community.",
              "Live guidance with Dr. Fawzia Yassmina.",
            ],
          },
          {
            heading: "What This Experience Can Open For You",
            intro:
              "This is an experience designed to take you beyond the level from which you have been experiencing yourself and your life. You will be guided to:",
            items: [
              "Liberate yourself from the emotional patterns that keep recreating the same reality. Go beneath the surface of recurring reactions, relationships, choices, and experiences to meet the deeper patterns from which they arise, and begin releasing their hold over your life.",
              "Move beyond the automatic version of you. Discover how much of what you call “me” may actually be conditioning, emotional memory, protective responses, and subconscious programming, and experience the freedom that becomes possible when you are no longer unconsciously governed by them.",
              "Change the state from which you experience life. Rather than continuously trying to control the world around you in order to feel different within, learn to transform the internal state through which you perceive, interpret, choose, relate, and create.",
              "Experience emotional freedom at an entirely different depth. Not by suppressing difficult emotions or forcing yourself to think positively, but by learning how to meet, process, and move beyond the emotional states that have kept you contracted.",
              "Expand your perception beyond the reality your past has taught you to expect. As old emotional filters begin to loosen, you may discover possibilities, choices, perspectives, and versions of yourself that were previously invisible from within the old state.",
              "Access higher states of consciousness. Journey from emotional survival through courage, acceptance, and love, and into progressively expanded states of awareness, peace, conscious creation, and alignment within the NeuroHolistic consciousness framework.",
              "Experience the space between who you have been and who you are capable of becoming. Beyond the story. Beyond the conditioning. Beyond the automatic response. And begin asking a fundamentally different question: “If my past no longer has to determine the state from which I live… what becomes possible now?”",
            ],
          },
          {
            heading: "Who Is This For?",
            intro: "This experience is for those who feel ready to go deeper.",
            items: [
              "For those who recognize that changing circumstances alone does not necessarily change the patterns through which life is experienced.",
              "For those who want to understand themselves beyond their automatic reactions.",
              "For those seeking greater awareness, emotional freedom, inner peace, conscious choice, and a different relationship with themselves and life.",
              "No previous experience with the NeuroHolistic Method™ is required. Only curiosity, commitment, and the willingness to meet yourself honestly.",
            ],
          },
        ],
        closingLine:
          "Liberate. Expand. Elevate. Align. Embody. — NeuroHolistic Consciousness Quantum Leap™, October 9 to 31, 2026, Live Online.",
        price: "AED 1,000 / USD 274",
        ctaLabel: "Book Now",
        date: "October 9 – 31, 2026",
        time: "6:00 PM – 10:00 PM",
        location: "Online, Live",
        typeLabel: "Live online",
      },
      ar: {
        title: "القفزة الكمية في الوعي بمنهج NeuroHolistic™",
        subtitle: "رحلة غامرة مباشرة عبر الإنترنت إلى آفاق أوسع من الوعي",
        cardDescription:
          "رحلة غامرة مباشرة عبر الإنترنت — 20 ساعة على مدار خمس جلسات مع فترة دمج موجّهة — صُممت لتأخذك إلى ما هو أبعد من الأنماط العاطفية التلقائية، ولتغير مستوى الوعي الذي تختبر منه الحياة.",
        hook:
          "تخيل... أنت في سلام. أنت حرّ حقاً. أنت تخلق حياتك بوعي. هذا ليس حلماً، بل هي الحياة من مستوى مختلف من الوعي.",
        description:
          "يقضي معظم الناس حياتهم وهم يحاولون تغيير ظروفهم، دون وعي بالأنماط العاطفية، والبرمجة المكتسبة، والاستجابات التلقائية، والتصورات التي تؤثر بصمت في أفكارهم، وقراراتهم، وعلاقاتهم، وطريقة اختبارهم للحياة.\n\nالقفزة الكمية في الوعي بمنهج NeuroHolistic™ هي تجربة تحولية غامرة، صُممت لتأخذك إلى ما هو أبعد من تلك الأنماط التلقائية، وإلى طريقة مختلفة جذرياً لاختبار نفسك، والآخرين، والحياة.\n\nوتستند هذه التجربة إلى منهج NeuroHolistic™، حيث تجمع بين علم النفس، والمبادئ المستندة إلى علوم الأعصاب، واستكشاف العقل اللاواعي، والوعي الجسدي، ومعالجة المشاعر، وتطوير الوعي، ضمن رحلة تحولية واحدة متكاملة.\n\nوالهدف هو تغيير المستوى الذي تختبر منه الحياة.",
        schedule: {
          heading: "الرحلة",
          intro:
            "تتكشف التجربة عبر جلستي تحرر مباشرتين، تليهما رحلة دمج موجّهة مع تذكيرات وممارسات يومية، ثم جلستا ارتقاء مباشرتان، وأخيراً جلسة الدمج والتجسيد.",
          columns: { part: "الجزء", description: "الوصف", date: "التاريخ" },
          rows: [
            {
              part: "الجزء الأول — التحرر",
              description: "جلستان مباشرتان متتاليتان",
              date: "9 و 10 أكتوبر · 6:00 إلى 10:00 مساءً",
            },
            {
              part: "الدمج الموجّه",
              description:
                "تنضم إلى مجتمع المشاركين الخاص وتتلقى إرشادات، ومحفزات وعي، وممارسات من منهج NeuroHolistic™",
              date: "11 إلى 22 أكتوبر",
            },
            {
              part: "الجزء الثاني — الارتقاء",
              description: "جلستان مباشرتان متتاليتان",
              date: "23 و 24 أكتوبر · 6:00 إلى 10:00 مساءً",
            },
            {
              part: "الدمج والتجسيد",
              description: "جلسة مباشرة واحدة",
              date: "31 أكتوبر · 6:00 إلى 10:00 مساءً",
            },
          ],
        },
        sections: [
          {
            heading: "1. الجزء الأول — التحرر",
            intro: "9 و 10 أكتوبر 2026 · 6:00 إلى 10:00 مساءً · 8 ساعات مباشرة عبر الإنترنت",
            items: [
              "على مدار جلستين مكثفتين مباشرتين، ستستكشف الأنماط العاطفية، والبرمجة المكتسبة، والاستجابات اللاواعية، والحالات التلقائية التي قد تبقيك تعمل من مستويات وعي منكمشة.",
              "من خلال العملية التحولية في منهج NeuroHolistic™، سيتم إرشادك عبر: الوعي ← الإقرار ← التعرّف ← السماح ← المعالجة ← الارتقاء.",
              "نخوض معاً رحلة عبر حالات عاطفية مثل الخزي، والذنب، والخوف، والغضب، وغيرها من أنماط النجاة العاطفية، وصولاً إلى الشجاعة، والتقبّل، والحب.",
              "يصبح الحب هو الجسر. لأنه قبل أن يتسع الوعي، علينا أولاً أن نخلق مساحة تتجاوز ما كان يتحكم بنا دون وعي.",
            ],
          },
          {
            heading: "2. رحلة الدمج الموجّه",
            intro:
              "11 إلى 22 أكتوبر 2026. تستمر التجربة المباشرة داخل الحياة اليومية، وتتطلب 15 دقيقة يومياً من الممارسات البسيطة.",
            items: [
              "خلال الفترة الفاصلة بين الأسبوعين المكثفين، ستصبح جزءاً من مجتمع خاص بالمشاركين، وستتلقى إرشادات، ومحفزات وعي، وممارسات من منهج NeuroHolistic™ تساعدك على ملاحظة ما يحدث داخلك أثناء حياتك اليومية.",
              "بدلاً من التعامل مع الدمج كواجب منزلي، تدعوك هذه الممارسات لأن تصبح أكثر وعياً باستجاباتك العاطفية، وجسدك، وأفكارك، وتصوراتك، وعلاقاتك، وخياراتك، وأنماطك التلقائية.",
              "تتضمن رحلة الدمج ممارستين تدريجيتين، مدعومتين بمحفزات وتذكيرات يومية قصيرة.",
              "لأن الوعي يصبح قوياً حين يتجاوز الجلسة ويدخل إلى الحياة اليومية.",
            ],
          },
          {
            heading: "3. الجزء الثاني — الارتقاء",
            intro: "23 و 24 أكتوبر 2026 · 6:00 إلى 10:00 مساءً · 8 ساعات مباشرة عبر الإنترنت",
            items: [
              "بعد أن تُخلق المساحة، تنتقل الرحلة من التحرر إلى الاتساع.",
              "تستكشف هاتان الجلستان المكثفتان حالات وعي أوسع تدريجياً، وإمكانية اختبار نفسك والحياة بما يتجاوز البرمجة المعتادة والإدراك التلقائي.",
              "نتجاوز الحب نحو الطبقات الأعلى من إطار الوعي في منهج NeuroHolistic™، مستكشفين الوعي المتسع، والسلام، والخلق الواعي، والانسجام.",
              "ينتقل التركيز تدريجياً من سؤال: “مما أحاول أن أتحرر؟” إلى سؤال: “من أي مستوى من الوعي أختار أن أعيش؟”",
            ],
          },
          {
            heading: "4. الدمج والتجسيد",
            intro: "31 أكتوبر 2026 · الجلسة المباشرة الختامية",
            items: [
              "بعد أسبوع من التجربة المكثفة، نلتقي مرة أخرى.",
              "تخلق هذه الجلسة مساحة للتأمل فيما تغير، واستكشاف ما ظهر عند عودتك إلى حياتك اليومية، وطرح الأسئلة، ودمج الرؤى، ودعم تجسيد العمل بعد انتهاء الفعالية.",
              "الهدف ليس أن تغادر بتجربة مؤقتة، بل أن تحمل وعياً أعمق إلى طريقة عيشك الفعلية.",
            ],
          },
          {
            heading: "التجربة الكاملة",
            items: [
              "20 ساعة مباشرة.",
              "4 جلسات مكثفة مباشرة × 4 ساعات.",
              "جلسة ختامية واحدة للدمج والتجسيد مدتها 4 ساعات.",
              "رحلة دمج موجّهة.",
              "محفزات وممارسات وعي يومية.",
              "مجتمع خاص بالمشاركين.",
              "إرشاد مباشر مع الدكتورة فوزية ياسمينا.",
            ],
          },
          {
            heading: "ماذا يمكن أن تفتح لك هذه التجربة؟",
            intro:
              "هذه تجربة صُممت لتأخذك إلى ما هو أبعد من المستوى الذي كنت تختبر منه نفسك وحياتك. سيتم إرشادك لـ:",
            items: [
              "التحرر من الأنماط العاطفية التي تعيد خلق الواقع نفسه مرة بعد مرة، والنفاذ إلى ما تحت سطح الردود والعلاقات والخيارات المتكررة.",
              "تجاوز النسخة التلقائية منك، واكتشاف كم مما تسميه “أنا” قد يكون برمجة وذاكرة عاطفية واستجابات دفاعية.",
              "تغيير الحالة التي تختبر منها الحياة، بدلاً من محاولة السيطرة المستمرة على العالم من حولك لتشعر بشكل مختلف في داخلك.",
              "اختبار الحرية العاطفية على عمق مختلف تماماً، لا بكبت المشاعر الصعبة ولا بإجبار نفسك على التفكير الإيجابي، بل بتعلم كيف تلتقيها وتعالجها وتتجاوزها.",
              "توسيع إدراكك إلى ما هو أبعد من الواقع الذي علّمك ماضيك أن تتوقعه.",
              "الوصول إلى حالات أعلى من الوعي، من النجاة العاطفية عبر الشجاعة والتقبل والحب، إلى السلام والخلق الواعي والانسجام.",
              "اختبار المساحة بين من كنت ومن يمكنك أن تكون. وأن تبدأ بطرح سؤال مختلف جذرياً: “إذا لم يعد ماضيي مضطراً لتحديد الحالة التي أعيش منها… فما الذي يصبح ممكناً الآن؟”",
            ],
          },
          {
            heading: "لمن صُممت هذه التجربة؟",
            intro: "هذه التجربة لمن يشعرون بالاستعداد للذهاب أعمق.",
            items: [
              "لمن يدركون أن تغيير الظروف وحده لا يغير بالضرورة الأنماط التي تُعاش الحياة من خلالها.",
              "لمن يرغبون في فهم أنفسهم بما يتجاوز ردود أفعالهم التلقائية.",
              "لمن يبحثون عن وعي أكبر، وحرية عاطفية، وسلام داخلي، واختيار واعٍ، وعلاقة مختلفة مع أنفسهم ومع الحياة.",
              "لا تُشترط خبرة سابقة بمنهج NeuroHolistic™. كل ما يلزم هو الفضول، والالتزام، والاستعداد لأن تلتقي نفسك بصدق.",
            ],
          },
        ],
        closingLine:
          "تحرر. اتّسع. ارتقِ. انسجم. جسّد. — القفزة الكمية في الوعي بمنهج NeuroHolistic™، من 9 إلى 31 أكتوبر 2026، مباشرة عبر الإنترنت.",
        price: "1,000 درهم إماراتي - 274 دولار أمريكي",
        ctaLabel: "احجز الآن",
        date: "9 – 31 أكتوبر 2026",
        time: "6:00 – 10:00 مساءً",
        location: "مباشرة عبر الإنترنت",
        typeLabel: "جلسة عبر الإنترنت",
      },
    },
  },
  {
    id: "4",
    typeKey: "online",
    filterPeriod: "2026-08",
    image: "/images/pages/events.jpg",
    slug: "intro-neuroholistic-method-live-online",
    locales: {
      en: {
        title: "Introduction to the NeuroHolistic Method™",
        subtitle: "A Two-Hour Live Experiential Online Event",
        cardDescription:
          "A live, two-hour online experience offering a practical introduction to the NeuroHolistic Method™ — exploring how thoughts, emotions, and patterns are connected.",
        hook:
          "Maybe you don't need to try harder. Perhaps you only need to see differently. This event will help you look at yourself from a different angle. Then, life will make more sense.",
        description:
          "Many people spend years searching for answers, trying to change their thoughts, emotions, behaviours, relationships, or even their health, yet often find themselves repeating the same patterns. Lasting transformation begins with a deeper understanding of how these experiences are connected.\n\nThe Introduction to the NeuroHolistic Method™ is a live, two-hour online experience that offers a practical introduction to a comprehensive framework for understanding human transformation. Drawing on neuroscience, psychology, subconscious processes, mind-body interaction, and human consciousness, this event provides participants with a new perspective on how meaningful and lasting change begins.\n\nThis is not a lecture or a motivational seminar. It is an interactive, experiential session where participants explore key NeuroHolistic principles through guided exercises, self-reflection, practical demonstrations, and real-life examples.",
        sections: [
          {
            heading: "What You Will Experience",
            intro: "During the event, you will:",
            items: [
              "Discover how thoughts, emotions, behaviours, beliefs, the nervous system, and life experiences continuously influence one another.",
              "Explore how subconscious patterns shape the way we perceive ourselves and the world around us.",
              "Experience practical NeuroHolistic exercises that increase self-awareness and deepen personal insight.",
              "Learn a different way of understanding recurring emotional, behavioural, and life patterns.",
              "Gain simple, practical tools that can be applied in everyday life.",
            ],
          },
          {
            heading: "Who Is This Event For?",
            intro: "This event is designed for anyone who wishes to:",
            items: [
              "Better understand themselves and the patterns influencing their life.",
              "Explore personal growth through a deeper and more integrated perspective.",
              "Experience the NeuroHolistic Method™ before joining more advanced programs.",
              "Discover a practical approach that views the human being as an interconnected whole rather than a collection of separate parts.",
              "No previous knowledge of psychology or therapy is required, only curiosity and an open mind.",
            ],
          },
          {
            heading: "What You Will Leave With",
            intro: "By the end of the session, you will leave with:",
            items: [
              "A clearer understanding of yourself and the interconnected nature of your thoughts, emotions, behaviours, and experiences.",
              "A practical introduction to the NeuroHolistic Method™ and its approach to lasting transformation.",
              "Greater awareness of the patterns that shape your daily life.",
              "Practical insights you can begin applying immediately.",
              "A fresh perspective on what meaningful personal transformation can look like.",
              "This event is an invitation to begin seeing yourself, and your life, through a different lens.",
            ],
          },
        ],
        closingLine:
          "You will know something about yourself that you can't unknow. Somehow, its impact will begin to show in your life.",
        price: "Free",
        ctaLabel: "Book Now",
        date: "August 26, 2026",
        time: "6:00 PM – 8:00 PM",
        location: "Online",
        typeLabel: "Live online",
      },
      ar: {
        title: "مقدمة إلى منهج NeuroHolistic™",
        subtitle: "تجربة عملية تفاعلية في لقاء مباشر عبر الإنترنت",
        cardDescription:
          "تجربة مباشرة عبر الإنترنت تمتد لساعتين، تقدم مدخلاً عملياً إلى منهج NeuroHolistic™ واستكشاف الترابط بين الأفكار والمشاعر والأنماط الحياتية.",
        hook:
          "ربما ليس عليك أن تحاول أكثر، بل أن تنظر للحياة من منظور مختلف. ستساعدك هذه الفعالية على النظر لنفسك من زاوية مختلفة، حينها فقط ستكتسب الحياة معنىً مختلف.",
        description:
          "يقضي كثير من الناس سنوات طويلة في البحث عن إجابات... يحاولون تغيير أفكارهم، أو مشاعرهم، أو سلوكياتهم، أو علاقاتهم، بل وحتى صحتهم، ومع ذلك يجدون أنفسهم يعودون إلى الأنماط ذاتها مرة بعد أخرى.\n\nذلك لأن التغيير الحقيقي لا يبدأ بمحاولة تغيير الأفكار أو المشاعر أو الظروف، بل بفهم أعمق للعلاقة التي تربطها جميعاً، وكيف تتفاعل معاً لتشكّل الطريقة التي نعيش بها حياتنا.\n\nمقدمة إلى منهج NeuroHolistic™ هي تجربة مباشرة عبر الإنترنت تمتد لساعتين، تقدم مدخلاً عملياً إلى منهج متكامل لفهم الإنسان، وكيف يحدث التحول الحقيقي والمستدام.\n\nويستند هذا المنهج إلى تكامل علوم الأعصاب، وعلم النفس، وآليات عمل العقل اللاواعي، والعلاقة بين العقل والجسد، والوعي الإنساني، ليقدم منظوراً جديداً يفسر كيف تتشكل تجاربنا، وكيف يبدأ التغيير الحقيقي... ولماذا يستمر.\n\nهذه المقدمة تمثل تجربة تفاعلية يعيشها المشاركون بأنفسهم، يستكشفون خلالها المبادئ الأساسية لمنهج NeuroHolistic™ من خلال تمارين موجهة، وتأملات ذاتية، وتطبيقات عملية، وأمثلة مستمدة من الحياة، تتيح لهم اختبار هذه المبادئ بصورة مباشرة.",
        sections: [
          {
            heading: "ماذا ستختبر في هذه التجربة؟",
            intro: "خلال هذه التجربة:",
            items: [
              "ستبدأ في رؤية نفسك وحياتك بطريقة مختلفة.",
              "ستكتشف كيف ترتبط أفكارك، ومشاعرك، وسلوكياتك، ومعتقداتك، وجهازك العصبي، وتجاربك الحياتية، وكيف يؤثر كل منها في الآخر بصورة مستمرة.",
              "ستتعرف إلى الدور الذي تلعبه الأنماط اللاواعية في تشكيل نظرتك لنفسك وللعالم من حولك.",
              "من خلال تمارين وتجارب عملية مستوحاة من منهج NeuroHolistic™.",
              "ستختبر منظوراً جديداً لفهم الأنماط المتكررة في حياتك، وتكتسب أدوات بسيطة وعملية يمكنك البدء بالاستفادة منها مباشرة.",
            ],
          },
          {
            heading: "لمن هذه التجربة؟",
            items: [
              "لكل من يشعر أن هناك طريقة أعمق لفهم نفسه.",
              "لكل من يرغب في رؤية حياته من منظور أكثر شمولاً وترابطاً.",
              "لكل من يبحث عن فهم لا يقتصر على معالجة الأعراض، بل يمتد إلى فهم الإنسان ككل متكامل.",
              "ولكل من يرغب في التعرف إلى منهج NeuroHolistic™ واختباره قبل الانتقال إلى برامجه المتقدمة.",
              "لا تحتاج إلى أي خلفية في علم النفس أو العلاج، يكفي أن تأتي بفضول صادق، وعقل منفتح، واستعداد لأن ترى نفسك بطريقة مختلفة.",
            ],
          },
          {
            heading: "ماذا ستحمل معك من هذه التجربة؟",
            intro: "مع نهاية هذه التجربة، ستغادر وأنت تحمل:",
            items: [
              "فهماً أعمق لنفسك، وللترابط بين أفكارك، ومشاعرك، وسلوكياتك، وتجاربك الحياتية.",
              "تصوراً عملياً عن منهج NeuroHolistic™ وكيف يفسّر التحول الحقيقي والمستدام.",
              "وعياً أكبر بالأنماط التي تؤثر في حياتك اليومية.",
              "أدوات ورؤى عملية يمكنك البدء بتطبيقها مباشرة.",
              "منظوراً جديداً لفهم معنى التحول الشخصي الحقيقي، وكيف يبدأ.",
              "هذه التجربة ليست سوى البداية. إنها دعوة لأن تنظر إلى نفسك، وتنظر إلى حياتك من زاوية مختلفة.",
            ],
          },
        ],
        closingLine:
          "ستعرف شيئاً عن نفسك. ومنذ تلك اللحظة، لن يعود بإمكانك أن تجهله. وسيجد هذا الاكتشاف طريقه، بطريقة أو بأخرى، ليغيّر شيئاً في حياتك.",
        price: "فعالية مجانية",
        ctaLabel: "احجز الآن",
        date: "26 أغسطس 2026",
        time: "6:00 – 8:00 مساءً",
        location: "عبر الإنترنت",
        typeLabel: "جلسة عبر الإنترنت",
      },
    },
  },
];
