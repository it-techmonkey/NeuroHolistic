import type { FeaturedRetreatData, RetreatItem } from "./types";

export const FEATURED_RETREAT: FeaturedRetreatData = {
  id: "featured-1",
  title: "لقاء تعارفي",
  description:
    "لقاء ترحيبي يهدف إلى التواصل مع مجتمع نيوروهوليستك واستكشاف ما الذي تقدّمه تجربة الخلوة. تمهّد هذه الجلسة التمهيدية لتجربة أعمق وأكثر اندماجا، سواء كنت جديدا على الطريقة أو عائدا لمتابعة رحلتك.",
  date: "12 أغسطس 2026، الساعة 4 مساءً بتوقيت الخليج",
  time: "4 PM GST",
  location: "عن بُعد",
  capacity: 20,
  duration: "ساعتان",
  image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
  tags: ["تنظيم عميق", "عمليات موجّهة", "دمج جماعي", "الطبيعة"],
  slug: "meet-and-greet-oxford-2026",
};

export const UPCOMING_RETREATS: RetreatItem[] = [
  {
    id: "1",
    title: "رحلة الاستعادة الربيعية",
    description:
      "رحلة غامرة تمتد ثلاثة أيام، تجمع بين جلسات نيوروهوليستك الموجّهة والممارسات المستندة إلى الطبيعة. ابتعد عن تفاصيل الحياة اليومية وانخرط بعمق في العملية التحوّلية.",
    date: "22–24 مايو 2025",
    location: "منتجع جبلي، عُمان",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
    slug: "spring-restoration-2025",
  },
  {
    id: "2",
    title: "ملتقى الدمج الصيفي",
    description:
      "تواصل مع ممارسين آخرين في إطار احتوائي داعم للدمج، والتأمل، واستمرار النمو من خلال طريقة نيوروهوليستك™.",
    date: "10–12 يوليو 2025",
    location: "مركز رحلات ساحلي، الإمارات العربية المتحدة",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80",
    slug: "summer-integration-2025",
  },
  {
    id: "3",
    title: "التعمّق الخريفي",
    description:
      "رحلة ممتدة للمستعدين للذهاب إلى عمق أكبر، وتتضمن جلسات مطوّلة، ودوائر جماعية، ووقتا فرديا للتأمل في الطبيعة.",
    date: "5–9 أكتوبر 2025",
    location: "نُزل في الغابة، المملكة المتحدة",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
    slug: "autumn-deep-dive-2025",
  },
];
