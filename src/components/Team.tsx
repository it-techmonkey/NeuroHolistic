"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type Member = {
  slug: string;
  name: string;
  title: string;
  image: string;
};

const FEATURED = {
  slug: "dr-fawzia-yassmina",
  name: "Dr. Fawzia Yassmina",
  title:
    "Founder of the NeuroHolistic Institute™ and Creator of the NeuroHolistic Method™",
  image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1400&q=80",
};

const MEMBERS: Member[] = [
  {
    slug: "mariam-al-kaisi",
    name: "Mariam Al Kaisi",
    title: "Certified Practitioner",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1400&q=80",
  },
  {
    slug: "noura-youssef",
    name: "Noura Youssef",
    title: "Certified Practitioner",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1400&q=80",
  },
  {
    slug: "zekra-khayata",
    name: "Zekra Khayata",
    title: "Certified Practitioner",
    image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=1400&q=80",
  },
  {
    slug: "reem-mobayed",
    name: "Reem Mobayed",
    title: "Certified Practitioner",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1400&q=80",
  },
  {
    slug: "fawares-azaar",
    name: "Fawares Azaar",
    title: "Certified Practitioner",
    image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=1400&q=80",
  },
  {
    slug: "joud-charafeddin",
    name: "Joud Charafeddin",
    title: "Certified Practitioner",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1400&q=80",
  },
];

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
                src={FEATURED.image}
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
                src={member.image}
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
