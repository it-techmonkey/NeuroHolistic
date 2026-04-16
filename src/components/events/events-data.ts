import type { EventItem } from "./types";

export const MOCK_EVENTS: EventItem[] = [
  {
    id: "1",
    title: "مقدمة إلى طريقة نيوروهوليستك™",
    description:
      "ورشة تمتد لنصف يوم، تستكشف أسس تنظيم الجهاز العصبي والبنية الخماسية للمراحل. وهي مناسبة لمن يتعرّفون إلى الطريقة للمرة الأولى أو يفكرون في خوض رحلة أعمق.",
    date: "15 أبريل 2025",
    time: "9:00 ص – 1:00 م",
    location: "معهد نيوروهوليستك، دبي",
    type: "ورشة عمل",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    capacity: 24,
    slug: "intro-neuroholistic-workshop",
  },
  {
    id: "2",
    title: "رحلة الربيع: استعادة ودمج",
    description:
      "رحلة تمتد لثلاثة أيام، تجمع بين الجلسات الموجّهة، والممارسات المستندة إلى الطبيعة، والدمج الجماعي. صُمّمت لدعم التحرير وإعادة تشكيل الأنماط النمائية ضمن إطار آمن ومحتوٍ.",
    date: "22–24 مايو 2025",
    time: "رحلة كاملة",
    location: "منتجع جبلي، عُمان",
    type: "رحلة",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    capacity: 16,
    slug: "spring-retreat-2025",
  },
  {
    id: "3",
    title: "جلسة عبر الإنترنت: أساسيات الجهاز العصبي",
    description:
      "جلسة حية عبر الإنترنت تتناول علم الجهاز العصبي الذاتي وأدوات عملية للتنظيم اليومي. مفتوحة للجميع، ولا تتطلب أي خبرة مسبقة.",
    date: "8 يونيو 2025",
    time: "6:00 م – 8:00 م (GST)",
    location: "عبر الإنترنت",
    type: "جلسة عبر الإنترنت",
    image: "/images/dummy-user.svg",
    slug: "online-nervous-system-basics",
  },
];
