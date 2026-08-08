import { Reveal } from './Reveal';

export const PageIntro = ({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) => (
  <section className="page-intro">
    <Reveal>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="page-title">{title}</h1>
      <p className="page-lead">{intro}</p>
    </Reveal>
  </section>
);
