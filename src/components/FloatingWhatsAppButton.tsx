import { CONTACT_INFO } from "@/lib/contact";

export default function FloatingWhatsAppButton() {
  return (
    <a
      href={CONTACT_INFO.whatsapp.href}
      target="_blank"
      rel="noreferrer"
      aria-label={`Chat with NeuroHolistic on WhatsApp at ${CONTACT_INFO.whatsapp.label}`}
      title={`WhatsApp: ${CONTACT_INFO.whatsapp.label}`}
      className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#0B0F2B] text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#25D366] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
    >
      <svg
        aria-hidden="true"
        className="h-6 w-6 sm:h-7 sm:w-7"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12.04 2a9.84 9.84 0 0 0-8.53 14.75L2 22l5.39-1.41A9.9 9.9 0 1 0 12.04 2Zm0 17.98a8.08 8.08 0 0 1-4.12-1.13l-.3-.18-3.2.84.85-3.12-.2-.32a8.08 8.08 0 1 1 6.97 3.91Zm4.43-6.06c-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1.03-.38-1.96-1.21a7.35 7.35 0 0 1-1.36-1.69c-.14-.24-.02-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.41.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.81-.2-.47-.4-.41-.55-.42h-.47c-.16 0-.42.06-.65.3-.22.24-.85.83-.85 2.03s.87 2.36.99 2.52c.12.16 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.47-.28Z" />
      </svg>
    </a>
  );
}
