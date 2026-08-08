export interface Project {
  id?: string;
  name: string;
  repoPath?: string;
  command: string;
  description: string;
  /** Optional case-study context. Existing project documents remain valid without these fields. */
  problem?: string;
  built?: string;
  decisions?: string[];
  outcome?: string;
  learnings?: string;
  stack?: string[];
  url: string;
  output: string;
  visible: boolean;
  order: number;
}

export interface Certificate {
  id?: string;
  name: string;
  issuer: string;
  /** @deprecated Legacy field retained for existing Firestore documents. The UI now derives issuer identity from `issuer`. */
  issuerLogo?: string;
  date: string;
  imageUrl?: string;
  /** ImageKit file ID for dashboard-side deletion/replacement of uploaded credentials. */
  mediaFileId?: string;
  mediaProvider?: 'imagekit';
  /** @deprecated Legacy Firebase Storage field retained for older documents only. */
  storagePath?: string;
  credentialUrl?: string;
  image?: string;
  url?: string;
  category?: 'Hard' | 'Challenging' | 'Easy';
  details?: string;
  credentialId?: string;
  visible: boolean;
  order: number;
}

export interface Experience {
  id?: string;
  role: string;
  company: string;
  duration: string;
  startDate?: string;
  endDate?: string;
  description: string[];
  techStack: string[];
  visible: boolean;
  order: number;
}

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  date: string;
  /** @deprecated v9 derives reading time from content automatically. Existing values are still accepted as fallback metadata. */
  readTime?: string;
  tags: string[];
  content: string;
  visible: boolean;
  upvotes?: number;
  order?: number;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface Capability {
  title: string;
  description: string;
  tools: string[];
}


export interface InterfaceCopy {
  navTagline: string;
  navProfile: string;
  navWork: string;
  navExperience: string;
  navCredentials: string;
  navWriting: string;
  navConnect: string;
  homePrimaryCta: string;
  homeSecondaryCta: string;
  homeScrollCue: string;
  homeManifestoA: string;
  homeManifestoB: string;
  capabilitiesEyebrow: string;
  capabilitiesTitle: string;
  capabilitiesIntro: string;
  workEyebrow: string;
  workAllCta: string;
  projectInspectCta: string;
  projectEmptyTitle: string;
  projectEmptyBody: string;
  experienceEyebrow: string;
  experienceTimelineCta: string;
  signalsEyebrow: string;
  signalsProjects: string;
  signalsCredentials: string;
  signalsWriting: string;
  signalsNote: string;
  snapshotEyebrow: string;
  snapshotTitle: string;
  snapshotExperience: string;
  snapshotProjects: string;
  snapshotCredentials: string;
  snapshotDirection: string;
  projectStoryCta: string;
  projectProblemLabel: string;
  projectBuiltLabel: string;
  projectDecisionsLabel: string;
  projectOutcomeLabel: string;
  projectLearningsLabel: string;
  writingEyebrow: string;
  writingAllCta: string;
  writingPrevious: string;
  writingNext: string;
  connectEyebrow: string;
  connectCta: string;
  aboutIntroEyebrow: string;
  aboutPhilosophyEyebrow: string;
  aboutQuote: string;
  aboutFactExperience: string;
  aboutFactLearning: string;
  aboutFactDirection: string;
  interestsEyebrow: string;
  interestsTitle: string;
  interestsIntro: string;
  interestSystemsTitle: string;
  interestSystemsBody: string;
  interestInfrastructureTitle: string;
  interestInfrastructureBody: string;
  interestAutomationTitle: string;
  interestAutomationBody: string;
  interestHomelabTitle: string;
  interestHomelabBody: string;
  workingSetEyebrow: string;
  workingSetTitle: string;
  elsewhereEyebrow: string;
  elsewhereTitle: string;
  projectsIntroEyebrow: string;
  projectsEmptyTitle: string;
  projectsEmptyBody: string;
  experienceIntroEyebrow: string;
  experienceEmptyTitle: string;
  experienceEmptyBody: string;
  credentialsIntroEyebrow: string;
  credentialViewCta: string;
  writingIntroEyebrow: string;
  contactIntroEyebrow: string;
  contactPublicProfiles: string;
  contactPrivacy: string;
  footerEyebrow: string;
  footerMeta: string;
}

export interface SiteSettings {
  name: string;
  shortName: string;
  location: string;
  availability: string;
  heroKicker: string;
  heroTitle: string;
  heroBody: string;
  currentFocus: string;
  aboutTitle: string;
  aboutBody: string;
  aboutNote: string;
  workTitle: string;
  workIntro: string;
  experienceTitle: string;
  experienceIntro: string;
  credentialsTitle: string;
  credentialsIntro: string;
  writingTitle: string;
  writingIntro: string;
  contactTitle: string;
  contactIntro: string;
  capabilities: Capability[];
  socials: {
    github: string;
    linkedin: string;
    discord: string;
    credly: string;
  };
  seo: {
    title: string;
    description: string;
  };
  chatbotEnabled: boolean;
  ui: InterfaceCopy;
}
