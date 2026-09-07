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
    replyToEmail: "fawzia.yassmina@neuroholisticinstitute.com",
    // TODO: client to provide the real WhatsApp community invite link before
    // October 4, 2026 — the "week before" email references it directly.
    communityLink: null,
    showOnAcademyPage: true,
    journeyTable: [
      {
        stage: { en: "Liberation", ar: "التحرر" },
        location: { en: "Live online", ar: "مباشر عبر الإنترنت" },
        date: { en: "Oct 9 & 10", ar: "9 و 10 أكتوبر" },
        time: { en: "6:00 PM to 10:00 PM", ar: "6:00 إلى 10:00 مساءً" },
      },
      {
        stage: { en: "Guided Integration", ar: "التكامل الموجّه" },
        location: { en: "WhatsApp Community", ar: "مجتمع واتساب" },
        date: { en: "Oct 11 to 22", ar: "11 إلى 22 أكتوبر" },
        time: { en: "15 minutes daily", ar: "15 دقيقة يومياً" },
      },
      {
        stage: { en: "Elevation", ar: "الارتقاء" },
        location: { en: "Live online", ar: "مباشر عبر الإنترنت" },
        date: { en: "Oct 23 & 24", ar: "23 و 24 أكتوبر" },
        time: { en: "6:00 PM to 10:00 PM", ar: "6:00 إلى 10:00 مساءً" },
      },
      {
        stage: { en: "Integration & Embodiment", ar: "التكامل والتجسيد" },
        location: { en: "Live online", ar: "مباشر عبر الإنترنت" },
        date: { en: "Oct 31", ar: "31 أكتوبر" },
        time: { en: "6:00 PM to 10:00 PM", ar: "6:00 إلى 10:00 مساءً" },
      },
    ],
    // Curated reminder sequence.
    //
    //  - ONE "week before" email for the whole journey (Oct 4).
    //  - A "day before" + "hour before" pair for each live session.
    //
    // The two back-to-back second days (Oct 10 and Oct 24) deliberately get
    // no "day before" email: it would land on the morning of the preceding
    // session and read "tomorrow we continue" hours before that day's own
    // "we begin in one hour" — confusing enough that someone might think the
    // session they're about to attend isn't happening.
    //
    // All sends are set to 16:45 Dubai so they are picked up by the single
    // daily cron in vercel.json, which runs at 13:00 UTC = 17:00 Dubai — see
    // the comment on that cron's route handler
    // (src/app/api/internal/send-event-reminders/route.ts) for why these two
    // times must move together. This is what makes the hour-before emails
    // land ~1 hour before an 18:00 session without needing a more frequent
    // (paid-plan) cron.
    scheduledEmails: [
      {
        key: "journey-week-before",
        sendAt: "2026-10-04T16:45:00",
        template: "week_before",
        targetSessionKey: "liberation-1",
      },
      // --- Part I, Liberation ---
      {
        key: "liberation-1-day-before",
        sendAt: "2026-10-08T16:45:00",
        template: "day_before",
        targetSessionKey: "liberation-1",
      },
      {
        key: "liberation-1-hour-before",
        sendAt: "2026-10-09T16:45:00",
        template: "hour_before",
        targetSessionKey: "liberation-1",
      },
      {
        key: "liberation-2-hour-before",
        sendAt: "2026-10-10T16:45:00",
        template: "hour_before",
        targetSessionKey: "liberation-2",
      },
      // --- Part II, Elevation ---
      {
        key: "elevation-1-day-before",
        sendAt: "2026-10-22T16:45:00",
        template: "day_before",
        targetSessionKey: "elevation-1",
      },
      {
        key: "elevation-1-hour-before",
        sendAt: "2026-10-23T16:45:00",
        template: "hour_before",
        targetSessionKey: "elevation-1",
      },
      {
        key: "elevation-2-hour-before",
        sendAt: "2026-10-24T16:45:00",
        template: "hour_before",
        targetSessionKey: "elevation-2",
      },
      // --- Integration & Embodiment ---
      {
        key: "integration-day-before",
        sendAt: "2026-10-30T16:45:00",
        template: "day_before",
        targetSessionKey: "integration",
      },
      {
        key: "integration-hour-before",
        sendAt: "2026-10-31T16:45:00",
        template: "hour_before",
        targetSessionKey: "integration",
      },
    ],
    liveSessions: [
      {
        key: "liberation-1",
        title: { en: "Part I — Liberation (Session 1)", ar: "الجزء الأول — التحرر (الجلسة 1)" },
        startsAt: "2026-10-09T18:00:00",
        endsAt: "2026-10-09T22:00:00",
        emailCopy: {
          dayBeforeLead: { en: "Tomorrow, we begin.", ar: "غداً، نبدأ." },
          dayBeforeContext: {
            en: "Your journey begins with Part I, Liberation.",
            ar: "تبدأ رحلتك مع الجزء الأول، التحرر.",
          },
          hourBeforeLead: { en: "We begin in one hour.", ar: "نبدأ بعد ساعة واحدة." },
          hourBeforeContext: {
            en: "Your journey begins today with Part I, Liberation.",
            ar: "تبدأ رحلتك اليوم مع الجزء الأول، التحرر.",
          },
          dateLine: { en: "October 9, 2026", ar: "9 أكتوبر 2026" },
          todayLine: { en: "Today, October 9", ar: "اليوم، 9 أكتوبر" },
        },
      },
      {
        key: "liberation-2",
        title: { en: "Part I — Liberation (Session 2)", ar: "الجزء الأول — التحرر (الجلسة 2)" },
        startsAt: "2026-10-10T18:00:00",
        endsAt: "2026-10-10T22:00:00",
        emailCopy: {
          dayBeforeLead: { en: "Tomorrow, we continue.", ar: "غداً، نواصل." },
          dayBeforeContext: {
            en: "Your journey continues with Part I, Liberation — Session 2.",
            ar: "تستمر رحلتك مع الجزء الأول، التحرر — الجلسة الثانية.",
          },
          hourBeforeLead: { en: "We continue in one hour.", ar: "نواصل بعد ساعة واحدة." },
          hourBeforeContext: {
            en: "Your journey continues today with Part I, Liberation — Session 2.",
            ar: "تستمر رحلتك اليوم مع الجزء الأول، التحرر — الجلسة الثانية.",
          },
          dateLine: { en: "October 10, 2026", ar: "10 أكتوبر 2026" },
          todayLine: { en: "Today, October 10", ar: "اليوم، 10 أكتوبر" },
        },
      },
      {
        key: "elevation-1",
        title: { en: "Part II — Elevation (Session 1)", ar: "الجزء الثاني — الارتقاء (الجلسة 1)" },
        startsAt: "2026-10-23T18:00:00",
        endsAt: "2026-10-23T22:00:00",
        emailCopy: {
          dayBeforeLead: { en: "Tomorrow, we elevate.", ar: "غداً، نرتقي." },
          dayBeforeContext: {
            en: "Your journey continues with Part II, Elevation.",
            ar: "تستمر رحلتك مع الجزء الثاني، الارتقاء.",
          },
          hourBeforeLead: { en: "We continue in one hour.", ar: "نواصل بعد ساعة واحدة." },
          hourBeforeContext: {
            en: "Your journey continues today with Part II, Elevation.",
            ar: "تستمر رحلتك اليوم مع الجزء الثاني، الارتقاء.",
          },
          dateLine: { en: "October 23, 2026", ar: "23 أكتوبر 2026" },
          todayLine: { en: "Today, October 23", ar: "اليوم، 23 أكتوبر" },
        },
      },
      {
        key: "elevation-2",
        title: { en: "Part II — Elevation (Session 2)", ar: "الجزء الثاني — الارتقاء (الجلسة 2)" },
        startsAt: "2026-10-24T18:00:00",
        endsAt: "2026-10-24T22:00:00",
        emailCopy: {
          dayBeforeLead: { en: "Tomorrow, we continue.", ar: "غداً، نواصل." },
          dayBeforeContext: {
            en: "Your journey continues with Part II, Elevation — Session 2.",
            ar: "تستمر رحلتك مع الجزء الثاني، الارتقاء — الجلسة الثانية.",
          },
          hourBeforeLead: { en: "We continue in one hour.", ar: "نواصل بعد ساعة واحدة." },
          hourBeforeContext: {
            en: "Your journey continues today with Part II, Elevation — Session 2.",
            ar: "تستمر رحلتك اليوم مع الجزء الثاني، الارتقاء — الجلسة الثانية.",
          },
          dateLine: { en: "October 24, 2026", ar: "24 أكتوبر 2026" },
          todayLine: { en: "Today, October 24", ar: "اليوم، 24 أكتوبر" },
        },
      },
      {
        key: "integration",
        title: { en: "Integration & Embodiment", ar: "التكامل والتجسيد" },
        startsAt: "2026-10-31T18:00:00",
        endsAt: "2026-10-31T22:00:00",
        emailCopy: {
          dayBeforeLead: { en: "Tomorrow, we come together one last time.", ar: "غداً، نلتقي للمرة الأخيرة." },
          dayBeforeContext: {
            en: "Your journey completes with the final session, Integration & Embodiment.",
            ar: "تكتمل رحلتك مع الجلسة الختامية، التكامل والتجسيد.",
          },
          hourBeforeLead: { en: "We gather in one hour.", ar: "نلتقي بعد ساعة واحدة." },
          hourBeforeContext: {
            en: "Today we come together for the final session, Integration & Embodiment.",
            ar: "نلتقي اليوم في الجلسة الختامية، التكامل والتجسيد.",
          },
          dateLine: { en: "October 31, 2026", ar: "31 أكتوبر 2026" },
          todayLine: { en: "Today, October 31", ar: "اليوم، 31 أكتوبر" },
        },
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
            "The experience unfolds through two live Liberation sessions, followed by a guided integration journey with daily reminders and practices, then two live Elevation sessions, and a final Integration & Embodiment session, as shown in the table below.",
          columns: { part: "Part", description: "Description", date: "Date" },
          rows: [
            {
              part: "Part 1 - Liberation",
              description: "2 successive Live Sessions",
              date: "October 9 & 10 · 6:00 PM to 10:00 PM",
            },
            {
              part: "Guided Integration",
              description:
                "You join private participant community and receive guidance, awareness prompts, and NeuroHolistic practices",
              date: "October 11 to 22",
            },
            {
              part: "Part 2 - Elevation",
              description: "2 successive Live Sessions",
              date: "October 23 & 24 · 6:00 PM to 10:00 PM",
            },
            {
              part: "Integration & Embodiment",
              description: "1 Live Session",
              date: "October 31 · 6:00 PM to 10:00 PM",
            },
          ],
        },
        sections: [
          {
            heading: "1. Part I, Liberation",
            intro: "October 9 & 10, 2026 · 6:00 PM to 10:00 PM · 8 Hours Live Online",
            paragraphs: [
              "Across two intensive live sessions, you will explore the emotional patterns, conditioning, subconscious responses, and automatic states that can keep you operating from contracted levels of consciousness.",
              "Through the NeuroHolistic transformational process, you will be guided through: Awareness → Acknowledgement → Identification → Allowing → Processing → Elevation",
              "We journey through emotional states such as shame, guilt, fear, anger, and other patterns of emotional survival, progressively opening toward courage, acceptance, and Love.",
              "Love becomes the bridge.",
              "Because before consciousness can expand, we first create space beyond what has been unconsciously controlling us.",
            ],
          },
          {
            heading: "2. The Guided Integration Journey",
            intro: "October 11 to 22, 2026",
            paragraphs: [
              "The live experience continues into everyday life. This part of the journey requires 15 minutes a day with simple integration practices.",
              "During the period between the two intensive weekends, you will become part of a private participant community and receive guidance, awareness prompts, and NeuroHolistic practices designed to help you observe what is happening within you as you move through your normal life.",
              "Rather than treating integration as homework, these practices invite you to become increasingly conscious of your emotional responses, body, thoughts, perceptions, relationships, choices, and automatic patterns.",
              "The integration journey will include two progressive practices, supported by short daily prompts and reminders.",
              "Because awareness becomes powerful when it moves beyond the session and enters everyday life.",
            ],
          },
          {
            heading: "3. Part II, Elevation",
            intro: "October 23 & 24, 2026 · 6:00 PM to 10:00 PM · 8 Hours Live Online",
            paragraphs: [
              "Once space has been created, the journey moves from liberation into expansion.",
              "These two intensive sessions explore progressively expanded states of awareness and the possibility of experiencing yourself and life beyond habitual conditioning and automatic perception.",
              "We move beyond Love toward the higher layers of the NeuroHolistic consciousness framework, exploring expanded awareness, peace, conscious creation, alignment, and what we describe within the framework as enlightenment.",
              "The focus gradually shifts from: “What am I trying to become free from?” to: “From what level of consciousness do I choose to live?”",
            ],
          },
          {
            heading: "4. Integration & Embodiment",
            intro: "October 31, 2026 · Final Live Integration Session",
            paragraphs: [
              "One week after the intensive, we come together again.",
              "This final session creates space to reflect on what has changed, explore what emerged as you returned to everyday life, ask questions, integrate insights, and support the embodiment of the work beyond the event itself.",
              "The objective is not to leave you with a temporary peak experience.",
              "It is to help you bring greater awareness into how you actually live.",
            ],
          },
          {
            heading: "The Complete Experience",
            items: [
              "20 Live Hours",
              "4 × 4-Hour Intensive Live Sessions",
              "1 Final 4-Hour Integration & Embodiment Session",
              "Guided Integration Journey",
              "Daily Awareness Prompts & Practices",
              "Private Participant Community",
              "Live Guidance with Dr. Fawzia Yassmina",
              "Location: Online, Live",
              "Price: AED 1,000 / USD 274",
            ],
          },
          {
            heading: "What This Experience Can Open For You",
            intro:
              "This is an experience designed to take you beyond the level from which you have been experiencing yourself and your life. Across this journey, you will be guided to move beyond the unconscious emotional patterns, conditioning, and automatic states that may have shaped your reality for years, often without you even realizing they were there. You will experience what becomes possible when you stop living from fear, guilt, shame, anger, emotional survival, and old subconscious programming, and begin accessing progressively expanded states of awareness, love, peace, freedom, and conscious creation. You will be guided to:",
            items: [
              "Liberate yourself from the emotional patterns that keep recreating the same reality. Go beneath the surface of recurring reactions, relationships, choices, and experiences to meet the deeper patterns from which they arise, and begin releasing their hold over your life.",
              "Move beyond the automatic version of you. Discover how much of what you call “me” may actually be conditioning, emotional memory, protective responses, and subconscious programming, and experience the freedom that becomes possible when you are no longer unconsciously governed by them.",
              "Change the state from which you experience life. Rather than continuously trying to control the world around you in order to feel different within, learn to transform the internal state through which you perceive, interpret, choose, relate, and create.",
              "Experience emotional freedom at an entirely different depth. Not by suppressing difficult emotions or forcing yourself to think positively, but by learning how to meet, process, and move beyond the emotional states that have kept you contracted.",
              "Expand your perception beyond the reality your past has taught you to expect. As old emotional filters begin to loosen, you may discover possibilities, choices, perspectives, and versions of yourself that were previously invisible from within the old state.",
              "Access higher states of consciousness. Journey from emotional survival through courage, acceptance, and love, and into progressively expanded states of awareness, peace, conscious creation, and alignment within the NeuroHolistic consciousness framework.",
              "Experience the space between who you have been and who you are capable of becoming. Beyond the story. Beyond the conditioning. Beyond the automatic response. And begin asking a fundamentally different question: “If my past no longer has to determine the state from which I live… what becomes possible now?”",
            ],
            outro:
              "This is the essence of the NeuroHolistic Consciousness Quantum Leap™. Changing the level of consciousness from which you experience and create your life.",
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
          "LIBERATE. EXPAND. ELEVATE. ALIGN. EMBODY. — NeuroHolistic Consciousness Quantum Leap™, October 9 to 31, 2026 | Live Online",
        price: "AED 1,000 / USD 274",
        ctaLabel: "Book Now",
        date: "October 9 – 31, 2026",
        time: "6:00 PM – 10:00 PM",
        location: "Online, Live",
        typeLabel: "Live online",
      },
      ar: {
        title: "قفزة نوعية في الوعي عبر منهج النيوهوليستك™",
        subtitle: "تجربة مكثفة ومباشرة عبر الإنترنت نحو وعي أكثر اتساعاً",
        cardDescription:
          "رحلة غامرة مباشرة عبر الإنترنت — 20 ساعة على مدار خمس جلسات مع فترة تكامل موجّهة — صُممت لتأخذك إلى ما وراء الأنماط العاطفية التلقائية، ولتغيّر مستوى الوعي الذي تختبر منه الحياة.",
        hook:
          "تخيّل... أن تعيش بسلام. أن تكون حراً بحق. أن تصنع حياتك بوعي. هذا ليس حلماً. إنها الحياة عندما تختبرها من مستوى مختلف من الوعي.",
        description:
          "يقضي معظم الناس حياتهم وهم يحاولون تغيير ظروفهم، دون أن يدركوا الأنماط العاطفية، والبرمجة والتكييف النفسي، والاستجابات التلقائية، والتصورات التي تؤثر بصمت في أفكارهم، وقراراتهم، وعلاقاتهم، وتجربتهم للحياة.\n\nقفزة نوعية في الوعي عبر منهج النيوهوليستك™ هي تجربة تحولية غامرة، صُممت لتأخذك إلى ما وراء تلك الأنماط التلقائية، نحو طريقة مختلفة جذرياً في اختبار ذاتك، والآخرين، والحياة.\n\nترتكز هذه التجربة على منهج النيوهوليستك™ NeuroHolistic Method™، وتجمع ضمن رحلة تحولية واحدة ومنظمة بين علم النفس، والمبادئ المستندة إلى علم الأعصاب، واستكشاف العقل الباطن، والوعي الجسدي، والمعالجة العاطفية، وتطوير الوعي.\n\nالهدف هو تغيير المستوى الذي تختبر منه الحياة.",
        schedule: {
          heading: "الرحلة",
          intro:
            "تتدرج التجربة عبر جلستين مباشرتين للتحرر، تليهما تجربة تكامل موجهة تتضمن ممارسات وتذكيرات يومية، ثم جلستين مباشرتين للارتقاء، وأخيراً جلسة ختامية للتكامل والتجسيد.",
          columns: { part: "المرحلة", description: "الوصف", date: "التاريخ" },
          rows: [
            {
              part: "المرحلة الأولى، التحرر",
              description: "جلستان مباشرتان متتاليتان",
              date: "9 و10 أكتوبر · من 6:00 إلى 10:00 مساءً",
            },
            {
              part: "التكامل الموجّه",
              description:
                "الانضمام إلى مجتمع خاص بالمشاركين، مع إرشادات ومحفزات للوعي وممارسات نيوهوليستك",
              date: "من 11 إلى 22 أكتوبر",
            },
            {
              part: "المرحلة الثانية، الارتقاء",
              description: "جلستان مباشرتان متتاليتان",
              date: "23 و24 أكتوبر · من 6:00 إلى 10:00 مساءً",
            },
            {
              part: "التكامل والتجسيد",
              description: "جلسة مباشرة واحدة",
              date: "31 أكتوبر · من 6:00 إلى 10:00 مساءً",
            },
          ],
        },
        sections: [
          {
            heading: "1. الجزء الأول، التحرر",
            intro: "9 و10 أكتوبر 2026 · من 6:00 مساءً إلى 10:00 مساءً · 8 ساعات مباشرة عبر الإنترنت",
            paragraphs: [
              "على امتداد جلستين مباشرتين مكثفتين، ستستكشف الأنماط العاطفية، والبرمجة والتكييف، واستجابات العقل الباطن، والحالات التلقائية التي قد تأسرك في مستويات منقبضة من الوعي.",
              "من خلال العملية التحولية لمنهج النيوهوليستك، سيتم إرشادك عبر: الوعي ← الإقرار ← التعرّف والتحديد ← السماح ← المعالجة ← الارتقاء",
              "ننتقل عبر حالات عاطفية مثل الخزي، والشعور بالذنب، والخوف، والغضب، وغيرها من أنماط الاستجابة الدفاعية الداخلية، لننفتح تدريجياً نحو الشجاعة، والتقبّل، والحب.",
              "ويصبح الحب هو الجسر.",
              "لأنه قبل أن يتمكن الوعي من الاتساع، نحتاج أولاً إلى خلق مساحة تتجاوز ما كان يتحكم بنا دون وعي.",
            ],
          },
          {
            heading: "2. رحلة التكامل الموجّه",
            intro: "من 11 إلى 22 أكتوبر 2026",
            paragraphs: [
              "تستمر التجربة المباشرة داخل حياتك اليومية. ويتطلب هذا الجزء من الرحلة 15 دقيقة يومياً فقط، من خلال ممارسات بسيطة للتكامل.",
              "خلال الفترة الفاصلة بين الجزأين المكثفين، ستصبح جزءاً من مجتمع خاص بالمشاركين، وستتلقى إرشادات، ومحفزات للوعي، وممارسات نيوهوليستك صُممت لمساعدتك على ملاحظة ما يحدث داخلك أثناء ممارستك لحياتك الطبيعية.",
              "وبدلاً من التعامل مع التكامل على أنه واجب عليك إنجازه، تدعوك هذه الممارسات إلى أن تصبح أكثر وعياً باستجاباتك العاطفية، وجسدك، وأفكارك، وتصوراتك، وعلاقاتك، واختياراتك، وأنماطك التلقائية.",
              "ستتضمن رحلة التكامل ممارستين متدرجتين، تدعمهما محفزات قصيرة وتذكيرات يومية.",
              "لأن الوعي يصبح أكثر قوة عندما يتجاوز حدود الجلسة ويدخل إلى تفاصيل الحياة اليومية.",
            ],
          },
          {
            heading: "3. الجزء الثاني، الارتقاء",
            intro: "23 و24 أكتوبر 2026 · من 6:00 مساءً إلى 10:00 مساءً · 8 ساعات مباشرة عبر الإنترنت",
            paragraphs: [
              "بعد أن يتم خلق المساحة الداخلية، تنتقل الرحلة من التحرر إلى الاتساع.",
              "تستكشف هاتان الجلستان المكثفتان حالات متدرجة من الوعي الأكثر اتساعاً، وإمكانية اختبار ذاتك والحياة خارج حدود البرمجة المعتادة والإدراك التلقائي.",
              "ننتقل إلى ما بعد الحب، نحو الطبقات الأعلى ضمن إطار الوعي في منهج النيوهوليستك، مستكشفين الوعي المتسع، والسلام، والخلق الواعي، والانسجام، وما نصفه ضمن هذا الإطار بـ الاستنارة.",
              "ويتحول التركيز تدريجياً من السؤال: «ممَّ أحاول أن أتحرر؟» إلى: «من أي مستوى من الوعي أختار أن أعيش؟»",
            ],
          },
          {
            heading: "4. التكامل والتجسيد",
            intro: "31 أكتوبر 2026 · الجلسة المباشرة الختامية للتكامل",
            paragraphs: [
              "بعد أسبوع من المرحلة المكثفة، نلتقي مجدداً.",
              "تخلق هذه الجلسة الختامية مساحة للتأمل فيما تغيّر، واستكشاف ما ظهر عندما عدت إلى تفاصيل حياتك اليومية، وطرح الأسئلة، ودمج الاستبصارات، ودعم تجسيد ما اختبرته في حياتك بعد انتهاء الحدث.",
              "فالهدف ليس أن تغادر بتجربة مؤقتة تبلغ فيها ذروة عابرة.",
              "بل أن تحمل وعياً أعمق إلى الطريقة التي تعيش بها حياتك فعلياً.",
            ],
          },
          {
            heading: "التجربة الكاملة",
            items: [
              "20 ساعة مباشرة",
              "4 جلسات مكثفة مباشرة، مدة كل منها 4 ساعات",
              "جلسة ختامية للتكامل والتجسيد، مدتها 4 ساعات",
              "رحلة تكامل موجّهة",
              "محفزات وممارسات يومية للوعي",
              "مجتمع خاص بالمشاركين",
              "مع د. فوزية ياسمينة",
              "المكان: مباشرة عبر الإنترنت",
              "السعر: 1,000 درهم إماراتي / 274 دولاراً أمريكياً",
            ],
          },
          {
            heading: "ما الذي يمكن أن تفتحه لك هذه التجربة؟",
            intro:
              "هذه تجربة صُممت لتأخذك إلى ما وراء المستوى الذي اعتدت أن تختبر منه ذاتك وحياتك. على امتداد هذه الرحلة، سيتم إرشادك لتتجاوز الأنماط العاطفية اللاواعية، والبرمجة، والحالات التلقائية التي ربما شكّلت واقعك لسنوات، وفي كثير من الأحيان دون أن تدرك حتى وجودها. ستختبر ما يمكن أن يصبح ممكناً عندما تتوقف عن العيش من الخوف، والذنب، والخزي، والغضب، والاستجابة الدفاعية الداخلية، والبرمجة القديمة للعقل الباطن، وتبدأ في الوصول تدريجياً إلى حالات أكثر اتساعاً من الوعي، والحب، والسلام، والحرية، والخلق الواعي. سيتم إرشادك نحو:",
            items: [
              "التحرر من الأنماط العاطفية التي تعيد خلق الواقع نفسه. اذهب إلى ما وراء سطح ردود الأفعال والعلاقات والاختيارات والتجارب المتكررة، لتصل إلى الأنماط الأعمق التي تنشأ منها، وتبدأ في تحرير نفسك من سيطرتها على حياتك.",
              "تجاوز النسخة التلقائية منك. اكتشف كم مما تسميه «أنا» قد يكون في حقيقته تكييفاً وبرمجة، وذاكرة عاطفية، واستجابات دفاعية، وبرامج لاواعية، واختبر الحرية التي تصبح ممكنة عندما لا تعود محكوماً بها دون وعي.",
              "تغيير الحالة التي تختبر منها الحياة. بدلاً من المحاولة المستمرة للسيطرة على العالم من حولك كي تشعر بشكل مختلف في داخلك، تعلّم كيف تغيّر الحالة الداخلية التي من خلالها تدرك، وتفسر، وتختار، وتتواصل، وتخلق.",
              "اختبار الحرية العاطفية على عمق مختلف تماماً. ليس من خلال قمع المشاعر الصعبة أو إجبار نفسك على التفكير بإيجابية، بل من خلال تعلم كيفية مواجهة الحالات العاطفية التي أبقتك في حالة من الانقباض، ومعالجتها، والانتقال إلى ما بعدها.",
              "توسيع إدراكك إلى ما وراء الواقع الذي علّمك ماضيك أن تتوقعه. مع بدء تحرر الفلاتر العاطفية القديمة، قد تكتشف إمكانات، واختيارات، ووجهات نظر، ونسخاً من ذاتك لم يكن بإمكانك رؤيتها من داخل حالتك القديمة.",
              "الوصول إلى حالات أعلى من الوعي. انتقل في رحلة من الاستجابة الدفاعية الداخلية، مروراً بالشجاعة والتقبّل والحب، وصولاً إلى حالات متدرجة من الوعي المتسع، والسلام، والخلق الواعي، والانسجام، ضمن إطار الوعي في منهج النيوهوليستك.",
              "اختبار المساحة بين من كنت، ومن يمكنك أن تصبح. ما وراء القصة. ما وراء البرمجة. ما وراء الاستجابة التلقائية. وابدأ بطرح سؤال مختلف جذرياً: «إذا لم يعد الماضي مضطراً إلى تحديد الحالة التي أعيش منها... فما الذي يصبح ممكناً الآن؟»",
            ],
            outro:
              "هذا هو جوهر قفزة الوعي النوعية، أن تغيّر مستوى الوعي الذي تختبر منه حياتك وتصنعها.",
          },
          {
            heading: "لمن صُممت هذه التجربة؟",
            intro: "هذه التجربة لمن يشعر بأنه مستعد للذهاب إلى عمق أكبر.",
            items: [
              "لمن يدرك أن تغيير الظروف وحده لا يعني بالضرورة تغيير الأنماط التي نختبر الحياة من خلالها.",
              "لمن يريد أن يفهم ذاته إلى ما وراء ردود أفعاله التلقائية.",
              "لمن يسعى إلى وعي أعمق، وحرية عاطفية، وسلام داخلي، واختيار واعٍ، وعلاقة مختلفة مع ذاته ومع الحياة.",
              "لا تحتاج إلى أي خبرة سابقة مع منهج النيوهوليستك™. كل ما تحتاجه هو الفضول، والالتزام، والاستعداد لمقابلة ذاتك بصدق.",
            ],
          },
        ],
        closingLine:
          "تحرّر. اتّسع. ارتقِ. انسجم. جسّد. — قفزة نوعية في الوعي عبر منهج النيوهوليستك™، من 9 إلى 31 أكتوبر 2026 | مباشرة عبر الإنترنت",
        price: "1,000 درهم إماراتي / 274 دولاراً أمريكياً",
        ctaLabel: "احجز الآن",
        date: "من 9 إلى 31 أكتوبر 2026",
        time: "من 6:00 إلى 10:00 مساءً",
        location: "مباشرة عبر الإنترنت",
        typeLabel: "جلسة عبر الإنترنت",
      },
    },
  },
];
