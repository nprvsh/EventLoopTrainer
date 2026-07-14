import { seoContent } from "@/config/seo";
import type { LocaleKey } from "@/types";
import s from "./EventLoopGuide.module.css";

type EventLoopGuideProps = {
  locale: LocaleKey;
};

export default function EventLoopGuide({ locale }: EventLoopGuideProps) {
  const seo = seoContent[locale];

  return (
    <section className={s.section} aria-labelledby="event-loop-guide-title">
      <h2 id="event-loop-guide-title">{seo.heading}</h2>
      <p>{seo.intro}</p>
      <div className={s.grid}>
        <div>
          <h3>{seo.conceptsTitle}</h3>
          <ul>
            {seo.concepts.map((concept) => <li key={concept}>{concept}</li>)}
          </ul>
        </div>
        <div>
          <h3>{seo.ruleTitle}</h3>
          <p>{seo.rule}</p>
        </div>
      </div>
    </section>
  );
}
