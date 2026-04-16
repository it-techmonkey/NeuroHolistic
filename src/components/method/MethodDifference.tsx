"use client";

import { useLang } from "@/lib/translations/LanguageContext";

export default function MethodDifference() {
  const { t } = useLang();
  const mp = t.methodPage;

  return (
    <section className="bg-[#FAFBFF] py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-12">
            <h2 className="text-[34px] mb-12 font-medium leading-[1.15] text-[#0F172A] md:text-[46px]">
              {mp.differenceTitle}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
              <div className="space-y-6 text-[16px] leading-[1.8] text-[#475569]">
                <p>{mp.differenceParagraph1}</p>
                <p>{mp.differenceParagraph2}</p>
                <p>{mp.differenceParagraph3}</p>
                <p>{mp.differenceParagraph4}</p>
                <p>{mp.differenceParagraph5}</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-8 text-[#0F172A]">{mp.keyDistinctions}</h3>
                <ul className="border-t border-[#E2E8F0]">
                  {mp.distinctionItems.map((item: string, i: number) => (
                    <li key={i} className="flex items-center justify-between border-b border-[#E2E8F0] py-6 text-[16px] text-[#475569]">
                      <span className="max-w-[85%]">{item}</span>
                      <span className="text-[#6366F1] font-mono text-[14px]">0{i + 1}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
