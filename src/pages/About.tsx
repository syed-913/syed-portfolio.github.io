import { ArrowUpRight, Cpu, FlaskConical, Network, Wrench } from 'lucide-react';
import { SEO } from '../components/features/SEO';
import { PageIntro } from '../components/ui/PageIntro';
import { Reveal } from '../components/ui/Reveal';
import { useSiteSettings } from '../hooks/useSiteSettings';

const About = () => {
  const { settings } = useSiteSettings();
  return (
    <>
      <SEO title={`Profile — ${settings.shortName}`} description={settings.aboutBody} path="/about" />
      <PageIntro eyebrow={settings.ui.aboutIntroEyebrow} title={settings.aboutTitle} intro={settings.aboutBody} />

      <section className="content-section profile-layout">
        <Reveal className="profile-statement">
          <p className="eyebrow">{settings.ui.aboutPhilosophyEyebrow}</p>
          <blockquote>“{settings.ui.aboutQuote}”</blockquote>
          <p>{settings.aboutNote}</p>
        </Reveal>
        <Reveal className="profile-facts" delay={0.08}>
          <div><span>Based in</span><strong>{settings.location}</strong></div>
          <div><span>Professional experience</span><strong>{settings.ui.aboutFactExperience}</strong></div>
          <div><span>Learning style</span><strong>{settings.ui.aboutFactLearning}</strong></div>
          <div><span>Direction</span><strong>{settings.ui.aboutFactDirection}</strong></div>
        </Reveal>
      </section>

      <section className="content-section">
        <Reveal>
          <div className="section-heading-row">
            <div><p className="eyebrow">{settings.ui.interestsEyebrow}</p><h2>{settings.ui.interestsTitle}</h2></div>
            <p className="section-copy">{settings.ui.interestsIntro}</p>
          </div>
        </Reveal>
        <div className="interest-grid">
          <Reveal className="interest-card"><Cpu /><h3>{settings.ui.interestSystemsTitle}</h3><p>{settings.ui.interestSystemsBody}</p></Reveal>
          <Reveal className="interest-card" delay={0.05}><Network /><h3>{settings.ui.interestInfrastructureTitle}</h3><p>{settings.ui.interestInfrastructureBody}</p></Reveal>
          <Reveal className="interest-card" delay={0.1}><Wrench /><h3>{settings.ui.interestAutomationTitle}</h3><p>{settings.ui.interestAutomationBody}</p></Reveal>
          <Reveal className="interest-card" delay={0.15}><FlaskConical /><h3>{settings.ui.interestHomelabTitle}</h3><p>{settings.ui.interestHomelabBody}</p></Reveal>
        </div>
      </section>

      <section className="content-section">
        <Reveal>
          <p className="eyebrow">{settings.ui.workingSetEyebrow}</p>
          <h2 className="medium-heading">{settings.ui.workingSetTitle}</h2>
        </Reveal>
        <div className="tool-marquee" aria-label="Current tools">
          {settings.capabilities.flatMap((item) => item.tools).filter((tool, index, array) => array.indexOf(tool) === index).map((tool) => <span key={tool}>{tool}</span>)}
        </div>
      </section>

      <section className="content-section social-panel">
        <Reveal>
          <p className="eyebrow">{settings.ui.elsewhereEyebrow}</p><h2>{settings.ui.elsewhereTitle}</h2>
          <div className="social-grid">
            <a href={settings.socials.github} target="_blank" rel="noreferrer">GitHub <ArrowUpRight /></a>
            <a href={settings.socials.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight /></a>
            <a href={settings.socials.credly} target="_blank" rel="noreferrer">Credly <ArrowUpRight /></a>
            <a href={settings.socials.discord} target="_blank" rel="noreferrer">Discord <ArrowUpRight /></a>
          </div>
        </Reveal>
      </section>
    </>
  );
};

export default About;
