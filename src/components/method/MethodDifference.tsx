export default function MethodDifference() {
  return (
    <section className="bg-[#FAFBFF] py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-12">
            <h2 className="text-[34px] mb-12 font-medium leading-[1.15] text-[#0F172A] md:text-[46px]">
              What Makes The <br/>Method <span className="italic text-[#64748B]">Different</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
              <div className="space-y-6 text-[16px] leading-[1.8] text-[#475569]">
                <p>
                  While many approaches focus on managing symptoms or addressing isolated aspects of human experience, the NeuroHolistic Method™ works with the human system as an integrated whole.
                </p>
                <p>
                  Human challenges rarely arise from a single cause. They emerge from complex interactions between neural patterns, emotional memory, physiological regulation, and deeper layers of perception. By working with these dimensions simultaneously, the NeuroHolistic Method™ allows transformation to occur at a deeper and more sustainable level.
                </p>
                <p>
                  Unlike linear therapeutic models, the method follows a structured five-phase architecture that gradually restores internal coherence. Each phase prepares the system for the next, allowing emotional release, cognitive restructuring, and behavioral change to unfold in a stable and integrative way.
                </p>
                <p>
                  Another distinguishing aspect of the NeuroHolistic Method™ is its emphasis on systemic coherence. Rather than focusing only on individual thoughts or behaviors, the method addresses the dynamic relationship between the brain, body, emotional memory, and internal awareness. When these systems begin to realign, many aspects of life naturally begin to change.
                </p>
                <p>
                  As a result, the work often extends beyond resolving specific challenges. Individuals frequently experience broader shifts in clarity, resilience, relationships, and their capacity to engage with life more consciously and intentionally.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-8 text-[#0F172A]">Key Distinctions</h3>
                <ul className="border-t border-[#E2E8F0]">
                  {[
                    "Works with the human system as an integrated whole",
                    "Addresses root patterns rather than isolated symptoms",
                    "Structured five-phase transformation process",
                    "Integrates neuroscience with systemic human development",
                    "Supports both healing and expansion of human potential"
                  ].map((item, i) => (
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