import React from "react";
import styles from "./ArabicHero.module.css";

type Props = {
  title?: string;
  subtitle?: string;
  ctaText?: string;
};

export default function ArabicHero({
  title = "نقطة انعطاف لصحتك العقلية",
  subtitle = "منهج متكامل للعافية النفسية: جلسات، موارد، واستشارات شخصية مصممة لك.",
  ctaText = "احجز الآن",
}: Props) {
  return (
    <section className={`${styles.hero} section-shell`} dir="rtl" lang="ar" aria-label="مقدمة">
      <div className={styles.heroInner}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
        <button className={styles.cta} aria-label={ctaText}>{ctaText}</button>
      </div>

      <div className={styles.visual} aria-hidden>
        <div className={styles.floatingCard}>
          <div>
            <div style={{fontSize: "1rem", fontWeight:700}}>جلسة تعريفية مجانية</div>
            <div style={{fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem"}}>٢٠ دقيقة عبر الفيديو</div>
          </div>
        </div>
      </div>
    </section>
  );
}
