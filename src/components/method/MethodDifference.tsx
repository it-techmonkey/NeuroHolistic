export default function MethodDifference() {
  return (
    <section className="bg-[#FAFBFF] py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5 lg:sticky lg:top-32 h-fit">
            <h2 className="text-[34px] font-medium leading-[1.15] text-[#0F172A] md:text-[46px]">
              What makes the <br/>Method <span className="italic text-[#64748B]">different.</span>
            </h2>
          </div>
          <div className="lg:col-span-7">
            <ul className="border-t border-[#E2E8F0]">
              {[
                "Works with the human system as an integrated whole",
                "Addresses root patterns rather than symptoms",
                "Structured five-phase transformation process",
                "Integrates neuroscience with development",
                "Supports both healing and expansion"
              ].map((item, i) => (
                <li key={i} className="flex items-center justify-between border-b border-[#E2E8F0] py-8 text-[18px] text-[#475569] md:text-[20px]">
                  <span className="max-w-[80%]">{item}</span>
                  <span className="text-[#6366F1] font-mono text-[14px]">0{i + 1}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}