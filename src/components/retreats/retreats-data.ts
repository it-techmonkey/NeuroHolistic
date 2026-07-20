import type { FeaturedRetreatData, RetreatItem } from "./types";

export const FEATURED_RETREAT: FeaturedRetreatData = {
  id: "featured-1",
  image: "/images/pages/retreat-img2.webp",
  capacity: 20,
  slug: "meet-and-greet-oxford-2026",
  tags: ["Deep regulation", "Guided processes", "Group integration", "Nature"],
  locales: {
    en: {
      title: "Meet & Greet",
      description:
        "An introductory gathering to connect with the NeuroHolistic community and explore what a retreat experience can offer. This session primes a deeper, more immersive journey whether you are new to the Method or returning to continue your path.",
      date: "August 12, 2026 — 4:00 PM Gulf Time",
      time: "4 PM GST",
      location: "Remote",
      duration: "2 hours",
    },
    ar: {
      title: "لقاء تعارفي",
      description:
        "لقاء ترحيبي يهدف إلى التواصل مع مجتمع نيوروهوليستك واستكشاف ما الذي تقدّمه تجربة الخلوة. تمهّد هذه الجلسة التمهيدية لتجربة أعمق وأكثر اندماجا، سواء كنت جديدا على الطريقة أو عائدا لمتابعة رحلتك.",
      date: "12 أغسطس 2026، الساعة 4 مساءً بتوقيت الخليج",
      time: "4 PM GST",
      location: "عن بُعد",
      duration: "ساعتان",
    },
  },
};

export const UPCOMING_RETREATS: RetreatItem[] = [
  {
    id: "4",
    image: "/images/pages/retreat.jpg",
    slug: "she-like-never-before",
    isWaitlistOnly: true,
    locales: {
      en: {
        title: "SHE: Like Never Before™",
        subtitle: "A Five-Day Sanctuary for Women",
        cardDescription:
          "An invitation to put the world down for a while, and gently reconnect with the woman beneath the roles, the expectations, and the endless pressure to become someone else.",
        hook:
          "You do not need to become anything. You simply need to allow yourself to be. Just think about it, \"What remains when the pressure to be everything for everyone... disappears?\"",
        description:
          "This retreat is an invitation to put the world down for a while. From the pressure to always be more, do more, carry more, and become more, or else be disappointed, not enough or broken.\n\nCreated through the NeuroHolistic Method™, SHE: Like Never Before™ is a deeply immersive experience that invites you to gently reconnect with the woman beneath the expectations, the roles, the responsibilities, and the endless pressure to become someone you were never meant to be, not by becoming someone new, but by allowing yourself to return to who you have always been. Because perhaps the woman you have been searching for has always been there.\n\nShe has simply been waiting for you to lay the loads down and come home.",
        closingLine:
          "Perhaps... You simply need to allow yourself to be. Because when the pressure to become everything for everyone finally disappears... what remains... is SHE. Like never before.",
        ctaLabel: "Join The Wish List",
        date: "Join The Wish List",
        location: "To be announced",
        duration: "5 days",
      },
      ar: {
        title: "هي: كما لم تكن من قبل",
        subtitle: "تجربة غامرة تمتد خمسة أيام للمرأة",
        cardDescription:
          "دعوة لأن تضعي العالم جانباً لبعض الوقت، وتعيدي التواصل بلطف مع المرأة الكامنة خلف الأدوار والتوقعات والضغط المستمر لتصبحي شخصاً آخر.",
        hook:
          "لستِ بحاجة إلى أن تصبحي شيئاً آخر. كل ما تحتاجينه هو أن تسمحي لنفسك أن تكوني. توقفي للحظة واسألي نفسك: \"ماذا يبقى عندما يختفي الضغط الذي يدفعك إلى أن تكوني كل شيء... لكل شخص\".",
        description:
          "هذه التجربة هي دعوة لأن تضعي العالم جانباً لبعض الوقت. وأن تتحرري من الضغط الذي يدفعك دائماً إلى أن تكوني أكثر، وتفعلي أكثر، وتتحملي أكثر، وتصبحي أكثر، وإلا فستخيبين الظن، أو تشعرين بأنك لستِ كافية، أو بأن هناك شيئاً مكسوراً في داخلك.\n\nومن خلال منهج NeuroHolistic™، صُمِّمت SHE: Like Never Before™ كتجربة غامرة وعميقة، تدعوك بلطف إلى إعادة التواصل مع المرأة الكامنة خلف التوقعات، والأدوار، والمسؤوليات، والضغط المستمر لتصبحي شخصاً لم تُخلقي لتكونيه؛ ليس بأن تصبحي امرأةً جديدة، بل بأن تسمحي لنفسك أن تعودي إلى المرأة التي كنتِها دائماً. لأن... ربما المرأة التي ظللتِ تبحثين عنها كانت هناك منذ البداية.\n\nوكل ما كانت تنتظره هو أن تضعي الأثقال جانباً... وتعودي إلى نفسك.",
        closingLine:
          "ربما... كل ما تحتاجينه هو أن تسمحي لنفسك أن تكون كما هي في العمق. لأنه عندما يختفي أخيراً الضغط الذي يدفعك إلى أن تكوني كل شيء... لكل شخص... ما يبقى... هو أنتٍ.. كما لم تكوني من قبل.",
        ctaLabel: "انضمي إلى قائمة الانتظار",
        date: "انضمي إلى قائمة الانتظار",
        location: "سيُعلن لاحقاً",
        duration: "5 أيام",
      },
    },
  },
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
    slug: "spring-restoration-2025",
    locales: {
      en: {
        title: "Spring Restoration Journey",
        description:
          "A three-day immersive journey combining guided NeuroHolistic sessions and nature-based practices. Step away from daily demands and engage deeply with transformation.",
        date: "May 22–24, 2025",
        location: "Mountain resort, Oman",
      },
      ar: {
        title: "رحلة الاستعادة الربيعية",
        description:
          "رحلة غامرة تمتد ثلاثة أيام، تجمع بين جلسات نيوروهوليستك الموجّهة والممارسات المستندة إلى الطبيعة. ابتعد عن تفاصيل الحياة اليومية وانخرط بعمق في العملية التحوّلية.",
        date: "22–24 مايو 2025",
        location: "منتجع جبلي، عُمان",
      },
    },
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80",
    slug: "summer-integration-2025",
    locales: {
      en: {
        title: "Summer Integration Gathering",
        description:
          "Connect with fellow practitioners in a supportive container for integration, reflection, and continued growth through the NeuroHolistic Method™.",
        date: "July 10–12, 2025",
        location: "Coastal retreat center, United Arab Emirates",
      },
      ar: {
        title: "ملتقى الدمج الصيفي",
        description:
          "تواصل مع ممارسين آخرين في إطار احتوائي داعم للدمج، والتأمل، واستمرار النمو من خلال طريقة نيوروهوليستك™.",
        date: "10–12 يوليو 2025",
        location: "مركز رحلات ساحلي، الإمارات العربية المتحدة",
      },
    },
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
    slug: "autumn-deep-dive-2025",
    locales: {
      en: {
        title: "Autumn Deep Dive",
        description:
          "An extended retreat for those ready to go deeper — with longer sessions, group circles, and solo time for reflection in nature.",
        date: "October 5–9, 2025",
        location: "Forest lodge, United Kingdom",
      },
      ar: {
        title: "التعمّق الخريفي",
        description:
          "رحلة ممتدة للمستعدين للذهاب إلى عمق أكبر، وتتضمن جلسات مطوّلة، ودوائر جماعية، ووقتا فرديا للتأمل في الطبيعة.",
        date: "5–9 أكتوبر 2025",
        location: "نُزل في الغابة، المملكة المتحدة",
      },
    },
  },
];

export const ALL_RETREATS = [FEATURED_RETREAT, ...UPCOMING_RETREATS];
