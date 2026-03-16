"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type Member = {
  slug: string;
  name: string;
  title: string;
  initials: string;
  palette: [string, string, string];
};

const FEATURED = {
  slug: "dr-fawzia-yassmina",
  name: "Dr. Fawzia Yassmina",
  title:
    "Founder of the NeuroHolistic Institute™ and Creator of the NeuroHolistic Method™",
  initials: "FY",
  palette: ["#C8D3F5", "#A7B7EA", "#7588D2"] as [string, string, string],
};

const MEMBERS: Member[] = [
  {
    slug: "mariam-al-kaisi",
    name: "Mariam Al Kaisi",
    title: "Certified Practitioner",
    initials: "MA",
    palette: ["#D5DBF8", "#B9C4F0", "#8C9DDE"],
  },
  {
    slug: "noura-youssef",
    name: "Noura Youssef",
    title: "Certified Practitioner",
    initials: "NY",
    palette: ["#E0E4FA", "#C2CBF4", "#9EADE8"],
  },
  {
    slug: "zekra-khayata",
    name: "Zekra Khayata",
    title: "Certified Practitioner",
    initials: "ZK",
    palette: ["#DCE3F6", "#BFCBEA", "#92A2D9"],
  },
  {
    slug: "reem-mobayed",
    name: "Reem Mobayed",
    title: "Certified Practitioner",
    initials: "RM",
    palette: ["#D7DFF5", "#B6C1EB", "#8497D8"],
  },
  {
    slug: "fawares-azaar",
    name: "Fawares Azaar",
    title: "Certified Practitioner",
    initials: "FA",
    palette: ["#D4DCF2", "#B2BEE8", "#8192D3"],
  },
  {
    slug: "joud-charafeddin",
    name: "Joud Charafeddin",
    title: "Certified Practitioner",
    initials: "JC",
    palette: ["#DEE4F8", "#C0CBF0", "#94A3DF"],
  },
];

function portraitDataUri(initials: string, palette: [string, string, string]) {
  const svg = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 960'>
  <defs>
    <linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='${palette[0]}'/>
      <stop offset='55%' stop-color='${palette[1]}'/>
      <stop offset='100%' stop-color='${palette[2]}'/>
    </linearGradient>
    <radialGradient id='halo' cx='50%' cy='12%' r='55%'>
      <stop offset='0%' stop-color='rgba(255,255,255,0.95)'/>
      <stop offset='100%' stop-color='rgba(255,255,255,0)'/>
    </radialGradient>
  </defs>
  <rect width='800' height='960' fill='url(#bg)'/>
  <ellipse cx='400' cy='150' rx='250' ry='120' fill='url(#halo)' opacity='0.55'/>
  <circle cx='400' cy='360' r='170' fill='rgba(255,255,255,0.35)'/>
  <path d='M170 860c36-160 148-250 230-250s197 90 233 250z' fill='rgba(255,255,255,0.28)'/>
  <text x='400' y='390' text-anchor='middle' fill='rgba(17,24,39,0.68)' font-family='Inter, Arial, sans-serif' font-size='74' font-weight='600'>${initials}</text>
</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export default function Team() {
  return (
    <section className="w-full bg-[#F4F5F7] px-6 py-[120px]">
      <div className="mx-auto max-w-[1200px]" style={{ fontFamily: "Inter, Satoshi, -apple-system, sans-serif" }}>
        <h2 className="mb-20 text-center text-[34px] font-semibold text-[#111827] sm:text-[40px] lg:text-[44px]">
          NeuroHolistic Team
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-[300px_repeat(3,minmax(0,1fr))]">
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.24 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            whileHover={{ y: -6 }}
            className="overflow-hidden rounded-[24px] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] md:col-span-2 lg:col-span-1 lg:row-span-2"
          >
            <div className="relative h-[320px] w-full overflow-hidden">
              <motion.img
                src={portraitDataUri(FEATURED.initials, FEATURED.palette)}
                alt={FEATURED.name}
                className="h-full w-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
            <div className="p-7">
              <h3 className="text-[22px] font-semibold text-[#111827]">{FEATURED.name}</h3>
              <p className="mt-2.5 text-[15px] leading-[1.6] text-[#6B7280]">{FEATURED.title}</p>
              <Link
                href={`/team/${FEATURED.slug}`}
                className="mt-5 inline-flex items-center rounded-[10px] bg-[#2B2F55] px-[18px] py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#1F2345]"
              >
                View Profile <span className="ml-1">→</span>
              </Link>
            </div>
          </motion.article>

          {MEMBERS.map((member, index) => (
            <motion.article
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.28 }}
              transition={{ duration: 0.45, delay: index * 0.06, ease: "easeOut" }}
              whileHover="hover"
              className="group relative h-[260px] cursor-pointer overflow-hidden rounded-[20px]"
            >
              <motion.img
                src={portraitDataUri(member.initials, member.palette)}
                alt={member.name}
                className="h-full w-full object-cover"
                variants={{ hover: { scale: 1.05 } }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />

              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/28 to-black/10"
                variants={{ hover: { background: "linear-gradient(to top, rgba(0, 0, 0, 0.74), rgba(0, 0, 0, 0.16))" } }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />

              <motion.div
                className="absolute inset-x-0 bottom-0 p-5"
                variants={{ hover: { y: -3 } }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <h3 className="text-[18px] font-semibold text-white">{member.name}</h3>
                <p className="text-[14px] text-white/80">{member.title}</p>
                <Link
                  href={`/team/${member.slug}`}
                  className="mt-2.5 inline-flex items-center rounded-[8px] bg-white/85 px-3.5 py-1.5 text-[13px] font-medium text-[#111827] backdrop-blur-sm transition-colors hover:bg-white"
                >
                  View Profile
                </Link>
              </motion.div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
