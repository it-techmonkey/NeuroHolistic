import Link from "next/link";

const MEMBERS = [
  { name: "Dr. Fawzia Yassmina", title: "Founder & Creator of the Method", initials: "FY" },
  { name: "Mariam Al Kaisi", title: "Certified Practitioner", initials: "MA" },
  { name: "Noura Youssef", title: "Certified Practitioner", initials: "NY" },
  { name: "Zekra Khayata", title: "Certified Practitioner", initials: "ZK" },
  { name: "Reem Mobayed", title: "Certified Practitioner", initials: "RM" },
  { name: "Fawares Azaar", title: "Certified Practitioner", initials: "FA" },
  { name: "Joud Charafeddin", title: "Certified Practitioner", initials: "JC" },
];

export default function Team() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-16">
          NeuroHolistic Team
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {MEMBERS.map((member) => (
            <div
              key={member.name}
              className="rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-square bg-gradient-to-br from-indigo-100 to-slate-200 flex items-center justify-center">
                <span className="text-3xl font-bold text-indigo-600/80">
                  {member.initials}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-slate-900 text-lg">
                  {member.name}
                </h3>
                <p className="text-slate-600 text-sm mt-1">{member.title}</p>
                <Link
                  href="/book"
                  className="mt-4 inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
