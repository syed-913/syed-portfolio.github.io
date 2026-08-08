import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowRight, Cloud, Container, Gauge, Network, Server, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Reveal } from '../components/ui/Reveal';
import { SEO } from '../components/features/SEO';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { getPublicCertificates, getPublicExperience, getPublicPosts, getPublicProjects } from '../services/db';
import type { BlogPost, Certificate, Experience, Project } from '../types/database';

const icons = [Server, Cloud, Container, Gauge];

const Home = () => {
  const { settings } = useSiteSettings();
  const reduce = useReducedMotion();
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    Promise.all([
      getPublicProjects().catch(() => []),
      getPublicPosts().catch(() => []),
      getPublicExperience().catch(() => []),
      getPublicCertificates().catch(() => []),
    ]).then(([projectData, postData, experienceData, certificateData]) => {
      setProjects(projectData);
      setPosts(postData);
      setExperience(experienceData);
      setCertificates(certificateData);
    });
  }, []);

  return (
    <>
      <SEO title={settings.seo.title} description={settings.seo.description} path="/" />
      <section className="hero-section">
        <div className="hero-grid">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="hero-copy"
          >
            <p className="eyebrow"><span className="status-dot" />{settings.heroKicker}</p>
            <h1>{settings.heroTitle}</h1>
            <p className="hero-body">{settings.heroBody}</p>
            <div className="hero-actions">
              <Link className="button button-primary" to="/projects">{settings.ui.homePrimaryCta} <ArrowRight size={17} /></Link>
              <Link className="button button-ghost" to="/contact">{settings.ui.homeSecondaryCta} <ArrowDownRight size={17} /></Link>
            </div>
          </motion.div>

          <motion.aside
            className="hero-orbit-card"
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={reduce ? undefined : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="orbit-visual" aria-hidden="true">
              <span className="orbit orbit-a" /><span className="orbit orbit-b" /><span className="orbit orbit-c" />
              <span className="orbit-core"><Network size={28} /></span>
              <span className="orbit-node node-a" /><span className="orbit-node node-b" /><span className="orbit-node node-c" />
            </div>
            <div className="orbit-copy">
              <p className="micro-label">Current orbit</p>
              <p>{settings.currentFocus}</p>
            </div>
            <div className="mini-status-grid">
              <div><span>Location</span><strong>{settings.location}</strong></div>
              <div><span>Status</span><strong>{settings.availability}</strong></div>
            </div>
          </motion.aside>
        </div>

        <div className="scroll-cue"><span>{settings.ui.homeScrollCue}</span><ArrowDownRight size={15} /></div>
      </section>

      <section className="manifesto-strip">
        <p>{settings.ui.homeManifestoA}</p>
        <p>{settings.ui.homeManifestoB}</p>
      </section>

      <section className="content-section">
        <Reveal>
          <div className="section-heading-row">
            <div><p className="eyebrow">{settings.ui.capabilitiesEyebrow}</p><h2>{settings.ui.capabilitiesTitle}</h2></div>
            <p className="section-copy">{settings.ui.capabilitiesIntro}</p>
          </div>
        </Reveal>
        <div className="capability-grid">
          {settings.capabilities.map((capability, index) => {
            const Icon = icons[index % icons.length];
            return (
              <Reveal key={capability.title} delay={index * 0.07} className="capability-card">
                <div className="capability-index">0{index + 1}</div>
                <Icon size={22} />
                <h3>{capability.title}</h3>
                <p>{capability.description}</p>
                <div className="tag-row">{capability.tools.map((tool) => <span key={tool}>{tool}</span>)}</div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="content-section work-preview">
        <Reveal>
          <div className="section-heading-row">
            <div><p className="eyebrow">{settings.ui.workEyebrow}</p><h2>{settings.workTitle}</h2></div>
            <Link to="/projects" className="text-link">{settings.ui.workAllCta} <ArrowRight size={16} /></Link>
          </div>
        </Reveal>
        <div className="project-preview-grid">
          {projects.slice(0, 3).map((project, index) => (
            <Reveal key={project.id ?? project.name} delay={index * 0.08} className="project-preview-card">
              <div className="project-visual">
                <div className="project-visual-grid" />
                <span className="project-number">0{index + 1}</span>
                <span className="project-command">{project.command || 'lab / build / iterate'}</span>
              </div>
              <div className="project-preview-copy">
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <a href={project.url} target="_blank" rel="noreferrer" className="text-link">{settings.ui.projectInspectCta} <ArrowDownRight size={15} /></a>
              </div>
            </Reveal>
          ))}
          {!projects.length && (
            <Reveal className="empty-state-card">
              <Sparkles size={22} /><h3>{settings.ui.projectEmptyTitle}</h3><p>{settings.ui.projectEmptyBody}</p>
            </Reveal>
          )}
        </div>
      </section>

      <section className="content-section split-section">
        <Reveal className="experience-teaser">
          <p className="eyebrow">{settings.ui.experienceEyebrow}</p>
          <h2>{settings.experienceTitle}</h2>
          <p>{settings.experienceIntro}</p>
          {experience.slice(0, 2).map((item) => (
            <div className="teaser-row" key={item.id ?? item.company}>
              <div><strong>{item.role}</strong><span>{item.company}</span></div><time>{item.duration}</time>
            </div>
          ))}
          <Link to="/experience" className="button button-ghost">{settings.ui.experienceTimelineCta} <ArrowRight size={16} /></Link>
        </Reveal>

        <Reveal className="numbers-panel" delay={0.08}>
          <p className="eyebrow">{settings.ui.signalsEyebrow}</p>
          <div className="big-number"><strong>{projects.length}</strong><span>{settings.ui.signalsProjects}</span></div>
          <div className="big-number"><strong>{certificates.length}</strong><span>{settings.ui.signalsCredentials}</span></div>
          <div className="big-number"><strong>{posts.length}</strong><span>{settings.ui.signalsWriting}</span></div>
          <p className="numbers-note">{settings.ui.signalsNote}</p>
        </Reveal>
      </section>

      <section className="content-section writing-preview">
        <Reveal>
          <div className="section-heading-row">
            <div><p className="eyebrow">{settings.ui.writingEyebrow}</p><h2>{settings.writingTitle}</h2></div>
            <Link to="/journals" className="text-link">{settings.ui.writingAllCta} <ArrowRight size={16} /></Link>
          </div>
        </Reveal>
        <div className="article-list">
          {posts.slice(0, 3).map((post, index) => (
            <Reveal key={post.id ?? post.slug} delay={index * 0.06}>
              <Link to={`/journal/${post.slug}`} className="article-row">
                <span className="article-index">0{index + 1}</span>
                <div><h3>{post.title}</h3><p>{post.tags?.join(' · ') || 'Technical note'}</p></div>
                <time>{post.date}</time><ArrowDownRight size={18} />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <Reveal>
          <p className="eyebrow">{settings.ui.connectEyebrow}</p>
          <h2>{settings.contactTitle}</h2>
          <p>{settings.contactIntro}</p>
          <Link to="/contact" className="button button-light">{settings.ui.connectCta} <ArrowRight size={17} /></Link>
        </Reveal>
      </section>
    </>
  );
};

export default Home;
