import type { SiteSettings } from "../types/database";

export const siteDefaults: SiteSettings = {
  name: "Syed Ammar Hussain",
  shortName: "Syed Ammar",
  location: "Karachi, Pakistan",
  availability: "Open to infrastructure opportunities",
  heroKicker: "Linux · Cloud · Security",
  heroTitle: "Linux.\nCloud.\nSecurity.",
  heroBody:
    "Hands-on Linux automation and security-aware infrastructure. Building depth in cloud and compliance through projects, certifications, and lab-based training.",
  currentFocus:
    "Kubernetes, Ansible, AWS, Terraform, Grafana, Podman and OPNsense",
  aboutTitle: "Linux, cloud and security. Connected.",
  aboutBody:
    "I’m an early-career infrastructure practitioner focused on Linux, cloud and security. My experience comes from hands-on projects, formal study, certifications and a lab-based cybersecurity and systems internship at Al-Nafi. I’m looking for an opportunity to put that foundation to work.",
  aboutNote:
    "My internship was lab-based training. I’m seeking my first role with responsibility for production systems.",
  workTitle: "Selected work",
  workIntro:
    "Projects are where I turn infrastructure concepts into something I can run, inspect and improve.",
  experienceTitle: "Experience",
  experienceIntro:
    "A lab-based cybersecurity and systems internship at Al-Nafi. The scope below describes structured training and practical exercises, with production experience still ahead.",
  credentialsTitle: "Credentials & education",
  credentialsIntro:
    "Certifications and formal study in cloud, security and compliance.",
  writingTitle: "Field notes",
  writingIntro:
    "What I learn becomes easier to keep when I write it down. These are my notes, experiments and technical reflections.",
  contactTitle: "Let’s build what’s next.",
  contactIntro:
    "If you’re hiring, collaborating, or simply want to compare notes, send me a message and I’ll get back to you.",
  capabilities: [
    {
      title: "Linux & systems",
      description:
        "Account lifecycle, permissions, services, troubleshooting and practical automation in Linux environments.",
      tools: ["Linux", "RHEL", "Bash", "Python"],
    },
    {
      title: "Cloud & networking",
      description:
        "AWS foundations and networking concepts, supported by certification and continued infrastructure study.",
      tools: ["AWS", "Cloud foundations", "Networking", "Virtualization"],
    },
    {
      title: "Security",
      description:
        "Security-aware automation, vulnerability assessment and incident response concepts practiced in labs.",
      tools: ["ISC2 CC", "Ethical hacking labs", "WSTG", "Incident response"],
    },
    {
      title: "Compliance foundations",
      description:
        "ISMS, controls and audit concepts developed through formal learning and ISO 27001 lead auditor certification.",
      tools: [
        "ISO/IEC 27001",
        "ISO 27017 / 27018",
        "CIS Controls",
        "NIST 800-82",
      ],
    },
  ],
  socials: {
    github: "https://github.com/syed-913",
    linkedin: "https://www.linkedin.com/in/syed-ammar-hussain/",
    discord: "https://discord.gg/G3ABYfxg",
    credly: "https://www.credly.com/users/syed-ammar-hussain.913",
  },
  seo: {
    title: "Syed Ammar — Linux, Cloud & Security",
    description:
      "Syed Ammar Hussain’s portfolio: Linux automation, cloud foundations, security projects, compliance learning, certifications, education and lab-based experience.",
  },
  chatbotEnabled: true,
  ui: {
    navTagline: "systems / cloud / ops",
    navProfile: "Profile",
    navWork: "Projects",
    navExperience: "Experience",
    navCredentials: "Credentials",
    navWriting: "Writing",
    navConnect: "Contact",
    homePrimaryCta: "Explore projects",
    homeSecondaryCta: "View experience",
    homeScrollCue: "Scroll to inspect",
    homeManifestoA: "System administration is the foundation.",
    homeManifestoB: "Cloud, automation and reliability are the direction.",
    capabilitiesEyebrow: "01 / Capabilities",
    capabilitiesTitle: "Systems thinking, across the layers.",
    capabilitiesIntro:
      "Linux is the operating foundation. Cloud expands the environment. Security and compliance shape how I approach both.",
    workEyebrow: "02 / Work",
    workAllCta: "All projects",
    projectInspectCta: "Inspect project",
    projectEmptyTitle: "No public projects yet.",
    projectEmptyBody:
      "I’m still preparing the next project for this space. Check back soon.",
    experienceEyebrow: "03 / Experience",
    experienceTimelineCta: "See the timeline",
    signalsEyebrow: "Portfolio signals",
    signalsProjects: "projects",
    signalsCredentials: "credentials",
    signalsEducation: "academic entries",
    signalsWriting: "field notes",
    signalsNote:
      "A quick snapshot of the work, learning and writing currently published here.",
    snapshotEyebrow: "At a glance",
    snapshotTitle: "Enough context to know where I fit.",
    snapshotExperience: "professional experience",
    snapshotProjects: "documented projects",
    snapshotCredentials: "credentials",
    snapshotEducation: "academic entries",
    snapshotCurrentlyStudying: "Currently studying",
    snapshotLearningCta: "View learning",
    snapshotDirection: "current direction",
    projectStoryCta: "Open case study",
    projectProblemLabel: "Problem / context",
    projectBuiltLabel: "What I built",
    projectDecisionsLabel: "Key decisions",
    projectOutcomeLabel: "Outcome",
    projectLearningsLabel: "What I learned",
    writingEyebrow: "04 / Writing",
    writingAllCta: "Read all notes",
    writingPrevious: "Previous note",
    writingNext: "Next note",
    connectEyebrow: "05 / Connect",
    connectCta: "Open a channel",
    aboutIntroEyebrow: "Profile / context",
    aboutPhilosophyEyebrow: "How I think about the work",
    aboutQuote: "Understand the system before trying to automate it.",
    aboutFactExperience: "Calculated from the experience timeline",
    aboutFactLearning: "Hands-on / homelab / documentation",
    aboutFactDirection: "SysAdmin → DevOps / Cloud / Kubernetes / SRE",
    interestsEyebrow: "What keeps me interested",
    interestsTitle: "From a single host to the system around it.",
    interestsIntro:
      "I’m not chasing development roles. I’m interested in operating, automating, securing, observing and improving the infrastructure that applications depend on.",
    interestSystemsTitle: "Systems",
    interestSystemsBody:
      "Linux administration, troubleshooting, lifecycle work and the practical details that keep hosts usable.",
    interestInfrastructureTitle: "Infrastructure",
    interestInfrastructureBody:
      "Networking, cloud primitives, identity, access and the connections between services.",
    interestAutomationTitle: "Automation",
    interestAutomationBody:
      "Replacing repeatable manual work with safer, documented and reproducible workflows.",
    interestHomelabTitle: "Homelab",
    interestHomelabBody:
      "A place to test tools, fail cheaply, understand behavior and turn curiosity into evidence.",
    workingSetEyebrow: "Working set",
    workingSetTitle: "Tools I’m around now",
    elsewhereEyebrow: "Elsewhere",
    elsewhereTitle: "Follow the evidence, not a title.",
    projectsIntroEyebrow: "Work / experiments / builds",
    projectsEmptyTitle: "No visible projects yet.",
    projectsEmptyBody:
      "I’m still preparing the next project for this space. Check back soon.",
    experienceIntroEyebrow: "Experience / professional context",
    experienceEmptyTitle: "No public experience entries yet.",
    experienceEmptyBody:
      "Professional history will appear here when published.",
    credentialsIntroEyebrow: "Learning / validation / education",
    credentialsCertificatesEyebrow: "Certifications / validated skills",
    credentialsCertificatesTitle: "Certifications",
    credentialsCertificatesIntro:
      "External validation of focused technical learning, kept separate from academic education so each signal stays easy to read.",
    credentialsEducationEyebrow: "Education / academic learning",
    credentialsEducationTitle: "Education",
    credentialsEducationIntro:
      "Formal academic progress and completed qualifications, presented as a timeline rather than another wall of certificate cards.",
    educationInProgress: "In progress",
    educationCompleted: "Completed",
    educationFieldLabel: "Field",
    educationPeriodLabel: "Timeline",
    certificateEmptyTitle: "No public certifications yet.",
    certificateEmptyBody: "Published certifications will appear here.",
    educationEmptyTitle: "No public education entries yet.",
    educationEmptyBody: "Academic milestones will appear here when published.",
    credentialUnavailable: "Credential file not attached",
    credentialViewCta: "View credential",
    writingIntroEyebrow: "Writing / field notes",
    contactIntroEyebrow: "Contact / open channel",
    contactPublicProfiles: "Prefer a public profile?",
    contactPrivacy:
      "Your email is used only so I can reply to your message. It is never displayed publicly on this site.",
    footerEyebrow: "End of page, not end of curiosity.",
    footerMeta: "Built as a living portfolio",
  },
};
