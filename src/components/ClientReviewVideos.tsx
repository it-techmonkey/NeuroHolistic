"use client";

const REVIEW_VIDEO_IDS = ["p2Jkd8jzEcE", "5QNC8cCo4hY", "GtuinW2sDGU"] as const;

function VideoEmbed({ videoId }: { videoId: string }) {
  const src = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#0F172A] shadow-[0_12px_40px_-18px_rgba(15,23,42,0.25)]">
      <div className="relative aspect-video w-full">
        <iframe
          title="YouTube video review"
          src={src}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}

type Props = {
  heading: string;
  subtitle: string;
};

export default function ClientReviewVideos({ heading, subtitle }: Props) {
  return (
    <div className="mt-16 border-t border-[#EEF2F6] pt-16 md:mt-20 md:pt-20">
      <div className="mb-10 text-center md:mb-12">
        <h3 className="text-[24px] font-semibold tracking-tight text-[#0F172A] md:text-[30px]">{heading}</h3>
        <p className="mx-auto mt-4 max-w-[560px] text-[16px] leading-[1.7] text-[#475569] md:text-[17px]">{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
        {REVIEW_VIDEO_IDS.map((id) => (
          <VideoEmbed key={id} videoId={id} />
        ))}
      </div>
    </div>
  );
}
