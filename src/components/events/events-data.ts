import type { EventItem } from "./types";

export const MOCK_EVENTS: EventItem[] = [
  {
    id: "1",
    typeKey: "workshop",
    filterPeriod: "2025-04",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    capacity: 24,
    slug: "intro-neuroholistic-workshop",
    locales: {
      en: {
        title: "Introduction to the NeuroHolistic Method™",
        description:
          "A half-day workshop exploring nervous-system regulation and the five-phase architecture. Ideal for newcomers or anyone considering a deeper journey.",
        date: "April 15, 2025",
        time: "9:00 AM – 1:00 PM",
        location: "NeuroHolistic Institute, Dubai",
        typeLabel: "Workshop",
      },
      ar: {
        title: "مقدمة إلى طريقة نيوروهوليستك™",
        description:
          "ورشة تمتد لنصف يوم، تستكشف أسس تنظيم الجهاز العصبي والبنية الخماسية للمراحل. وهي مناسبة لمن يتعرّفون إلى الطريقة للمرة الأولى أو يفكرون في خوض رحلة أعمق.",
        date: "15 أبريل 2025",
        time: "9:00 ص – 1:00 م",
        location: "معهد نيوروهوليستك، دبي",
        typeLabel: "ورشة عمل",
      },
    },
  },
  {
    id: "2",
    typeKey: "retreat",
    filterPeriod: "2025-05",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    capacity: 16,
    slug: "spring-retreat-2025",
    locales: {
      en: {
        title: "Spring Journey: Restoration & Integration",
        description:
          "A three-day journey blending guided sessions, nature-based practices, and group integration — designed to support release and developmental repatterning in a safe container.",
        date: "May 22–24, 2025",
        time: "Full retreat",
        location: "Mountain resort, Oman",
        typeLabel: "Retreat",
      },
      ar: {
        title: "رحلة الربيع: استعادة ودمج",
        description:
          "رحلة تمتد لثلاثة أيام، تجمع بين الجلسات الموجّهة، والممارسات المستندة إلى الطبيعة، والدمج الجماعي. صُمّمت لدعم التحرير وإعادة تشكيل الأنماط النمائية ضمن إطار آمن ومحتوٍ.",
        date: "22–24 مايو 2025",
        time: "رحلة كاملة",
        location: "منتجع جبلي، عُمان",
        typeLabel: "رحلة",
      },
    },
  },
  {
    id: "3",
    typeKey: "online",
    filterPeriod: "2025-06",
    image: "/images/dummy-user.svg",
    locales: {
      en: {
        title: "Online Session: Nervous System Basics",
        description:
          "A live online session on autonomic nervous-system dynamics and practical tools for daily regulation. Open to all; no prior experience required.",
        date: "June 8, 2025",
        time: "6:00 PM – 8:00 PM (GST)",
        location: "Online",
        typeLabel: "Live online",
      },
      ar: {
        title: "جلسة عبر الإنترنت: أساسيات الجهاز العصبي",
        description:
          "جلسة حية عبر الإنترنت تتناول علم الجهاز العصبي الذاتي وأدوات عملية للتنظيم اليومي. مفتوحة للجميع، ولا تتطلب أي خبرة مسبقة.",
        date: "8 يونيو 2025",
        time: "6:00 م – 8:00 م (GST)",
        location: "عبر الإنترنت",
        typeLabel: "جلسة عبر الإنترنت",
      },
    },
  },
];
