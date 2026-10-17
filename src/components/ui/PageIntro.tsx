import { InlineCopy } from "./InlineCopy";

export const PageIntro = ({
  title,
  intro,
}: {
  eyebrow?: string;
  title: string;
  intro: string;
}) => (
  <section className="page-intro">
    <h1 className="page-title"><InlineCopy>{title}</InlineCopy></h1>
    <p className="page-lead"><InlineCopy>{intro}</InlineCopy></p>
  </section>
);
