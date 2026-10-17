# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Recruiters and HR evaluating Syed Ammar's suitability for infrastructure, Linux, cloud, networking, support, and security-related opportunities.
- Hiring reviewers following the published projects, experience, credentials, and writing to assess the evidence behind his skills.
- Syed Ammar, managing the portfolio's public content and internal records through the existing private `/dashboard`.

## Product Purpose

The personal portfolio at [syedammar.engineer](https://syedammar.engineer/) serves three purposes:

1. Present a comprehensive public professional profile covering technical skills, accomplishments, projects, experience, certifications, and education.
2. Provide a central hub for relevant activity across GitHub, Medium, Credly, and other established public profiles.
3. Preserve the existing hidden dashboard for centralized content management.

Success means a recruiter can understand Syed Ammar's areas of focus and actual career stage, inspect supporting evidence, and make contact. Public content should remain manageable through the existing dashboard.

## Positioning

The confirmed focus is **Linux, Cloud, and Security, supported by foundational compliance knowledge**. Systems administration is part of that foundation; the portfolio should communicate the connections between infrastructure operation, automation, networking, and security.

The owner confirms that he has **no production-role or other real-world employment experience beyond a lab-based Al-Nafi internship**. Present capabilities through the appropriate evidence: internship training, projects, certifications, education, and writing. Preserve the distinction between training and production responsibility when presenting accomplishments or calculating experience.

The owner identified these career targets: Linux System Admin, Cloud Engineer, Systems Engineer, Network Engineer, IT Support, Tech Support, DevOps, DevSecOps, SysOps, Cloud Infrastructure Engineer, Infrastructure Engineer, Virtualization Engineer, Network & Security Engineer, and Site Reliability Engineer (SRE). These are target roles; they do not establish previous employment, seniority, or proficiency in every role. The unifying brand focus remains Linux / Cloud / Security.

Automation and scripting support the infrastructure and security positioning. The owner does not want a software-development or full-stack career identity.

## Operating Context

- The owner identifies the currently live portfolio as the source of truth for his experience, credentials, and other public facts. Preserve those facts alongside his explicit clarification that the internship was lab-based.
- The existing application is a React / TypeScript / Vite web SPA using Tailwind CSS, Framer Motion, and React Router. `package.json` defines `npm run dev`, `npm run build`, and `npm run lint`.
- Public routes are `/`, `/about`, `/projects`, `/experience`, `/credentials`, `/writing`, `/writing/:slug`, and `/contact`. Existing legacy routes redirect to their current equivalents.
- Firebase provides published projects, experience, credentials/education, and writing. Public collection reads filter on `visible == true`.
- Site copy can be managed through `siteSettings/main`, with `src/data/siteDefaults.ts` providing local fallback copy. The optional settings document was absent during the live review on 2026-10-14; its absence does not establish that the published content collections are empty.
- GitHub Pages hosts the site on the custom domain. Existing deployment workflows, route handling, and integrations are established project infrastructure.

## Capabilities and Constraints

### Existing capabilities to preserve

- Public presentation of skills, projects and case studies, experience, certifications, education, writing, and contact options.
- Dashboard management of site copy, projects, experience, credentials/education, writing, messages, analytics, and chatbot logs.
- Firebase Authentication for `/dashboard`, exclusion of that route from public navigation, and its existing noindex behavior. Route obscurity is supplementary to authentication.
- ImageKit credential media management through the existing Cloudflare Worker integration.
- The existing contact submission, integrated AI assistant, and their current service connections.
- A persistent dark/light theme switch and the existing pre-mount theme initialization.
- The custom interpolated cursor follower, with subtle hover scale/glow behavior and accommodations for touch pointers and reduced motion.

### Scope boundaries

- Frontend design, layout, component architecture, and aesthetics may change when the owner authorizes the redesign.
- Preserve ImageKit, Cloudflare Workers, the integrated AI chatbot, Firebase, and GitHub Pages / GitHub workflow deployment configurations. Change these only when strictly required for UI integration.
- Preserve published facts and working content-management flows. Do not introduce a backend migration, replacement deployment pipeline, or a new synchronization service based on the aggregation objective alone.
- Do not convert internship/lab duration into production employment experience. Do not infer certifications from the internship's tool or curriculum lists.
- Specific security, compliance, audit, and project-performance claims must retain their evidence and context. Foundational standards knowledge does not establish production audit or implementation experience.
- The owner explicitly authorized `redesign` after initialization and later requested `continue`. Frontend implementation, visual review, and design-system documentation are authorized. The owner also explicitly authorized a temporary headless browser after in-app screenshot capture failed.

### Open product decisions

- The Medium profile/feed URL and the expected aggregation behavior are not established by the current public records. The social settings model contains GitHub, LinkedIn, Discord, and Credly; the redesign adds an optional Medium URL that remains hidden until supplied.
- The owner explicitly does not want a public résumé, résumé download/export/print action, or résumé asset. An actual résumé contains private personal information and is shared privately. The portfolio presents only the approved public professional record.
- No narrower priority among the listed target role titles has been selected beyond the Linux / Cloud / Security brand focus.

## Brand Commitments

These are constraints volunteered by the owner; detailed visual decisions remain for the authorized redesign phase.

- Identity: Syed Ammar; full name in the existing profile data is Syed Ammar Hussain. Existing fallback location is Karachi, Pakistan.
- Terminal-inspired, grid-structured, high-tech interface with a polished, professional presentation.
- Emerald green as the primary accent, derived from the existing profile photograph.
- Clean, readable sans-serif text for the main content. Monospace is permitted for code blocks, tags, technical metadata, and footer details.
- Fully functional dark and light modes with smooth transitions.
- Preserve and refine smooth, interpolated cursor movement with subtle interactive hover scale/glow states.
- Existing portrait assets are `public/profile-avatar.webp` and `public/profile-avatar-nav.webp`.
- Keep the actual résumé private. Do not add résumé print, download or export actions, publish a résumé asset, or label the public profile as a résumé.
- Voice should convey the actual skills and evidence confidently while keeping training, certification, career targets, and employment history distinguishable.

## Evidence on Hand

The following inventory was read on **2026-10-14** from the same deployed public Firebase data used by the live portfolio, using the existing public visibility filter. Browser requests failed in the inspection session, but direct read-only requests to the deployed site's public content endpoint succeeded. The inventory records portfolio-published facts; it does not claim independent issuer verification or a rerun of project tests.

### Internship

Source: [live experience page](https://syedammar.engineer/experience/), published `experience` collection.

- Displayed role: **Cybersecurity & Systems Intern**.
- Displayed company: **Al-Nafi E-Learning Pvt. Ltd**. The owner refers to this as the Al-Nafi International College lab-based internship.
- Displayed duration: **November 2023 – November 2024**; the record describes a 12-month intensive internship.
- Published areas include Linux/RHEL, Python, vulnerability assessment and ethical-hacking labs, incident-response study, ISMS, and GRC.
- Published standards/curriculum include ISO 27001, ISO 27017, ISO 27018, CIS Top 20 Controls, NIST 800-82, and ISO 27019:2017 / SCADA security.
- `CISSP` appears in the internship's technical/curriculum list. It is **not** one of the published certification records and must not be presented as an earned CISSP certification.

### Certifications and education

Source: [live credentials page](https://syedammar.engineer/credentials/), published `certificates` collection. Records with `entryType: education` represent education; existing records without that field are treated as certifications by the application.

| Published credential name | Published issuer | Year |
| --- | --- | --- |
| Certified Cloud Practitioner | Amazon Web Services | 2025 |
| Certified AI Practitioner | Amazon Web Services | 2026 |
| Certified in Cybersecurity | ISC2 | 2025 |
| ISO/IEC 27001:2022 Lead Auditor | Mastermind | 2026 |

The published education entry is **EduQual UK Level 3 \| Diploma in Cloud Cyber Security**, at **Al-Nafi International College**, field **Cybersecurity**, **May 2025 – May 2026**, with status **completed**.

### Projects

Source: [live projects page](https://syedammar.engineer/projects/), published `projects` collection.

- **[User Management Console](https://github.com/syed-913/User_Management_Console)**: Bash-based Linux account-lifecycle automation, transactional batch operations, rollback/recovery, and a CIS-mapped audit. The published case study includes testing and benchmark claims; retain their project context and supporting repository evidence whenever those claims are used.
- **[FileSystem Audit & Data Pipeline](https://github.com/syed-913/FS-Audit-Data-Pipeline)**: remote Linux filesystem auditing and structured reporting using Python, Bash, MySQL, Paramiko, and Fernet.

These provide concrete evidence for Linux automation and security-aware infrastructure work. They do not establish production employment history.

### Writing and public profiles

Source: [live writing page](https://syedammar.engineer/writing/), published `posts` collection.

- **[Hands Down The Best Subnetting Explanation I've Ever Found](https://syedammar.engineer/writing/best-subnetting-explanation/)** — 2025-12-10.
- **[Building Linux From Scratch: Because Why Copy-Paste When You Can Suffer?](https://syedammar.engineer/writing/how-linux-work/)** — 2025-11-20.
- **[How I passed my RQF Level-3 Oral Assessment?](https://syedammar.engineer/writing/how-i-passed-my-rqf-level-3-oral-assessment/)** — 2025-11-15.

Existing fallback public profiles include [GitHub](https://github.com/syed-913), [LinkedIn](https://www.linkedin.com/in/syed-ammar-hussain/), and [Credly](https://www.credly.com/users/syed-ammar-hussain.913). The inspected writing records did not establish a Medium profile URL.

### Repository evidence

- `src/data/siteDefaults.ts`: fallback identity, positioning, copy, capabilities, and social links. The redesign updates the previous SysAdmin / DevOps / SRE emphasis to the owner's confirmed Linux / Cloud / Security positioning.
- `src/types/database.ts`: current content types and site settings model.
- `src/services/db.ts`: public visibility filtering, ordering, caching, and settings fallbacks.
- `src/App.tsx`: public routes, legacy redirects, and the private dashboard entry.
- `src/components/auth/DashboardPortal.tsx` and `src/components/auth/AdminGate.tsx`: dashboard authentication boundary.
- `src/components/features/CursorField.tsx`, `src/components/ui/ThemeToggle.tsx`, and `index.html`: existing cursor and theme behavior.

## Product Principles

1. Make role relevance clear through the Linux / Cloud / Security focus and supporting evidence.
2. Preserve career-stage accuracy: distinguish lab training, projects, education, certifications, target roles, and production employment.
3. Give recruiters a comprehensive public professional record with accessible links to the underlying work and credentials; keep the actual résumé private.
4. Keep the portfolio and its external profiles connected while retaining centralized content management.
5. Preserve established integrations and deployment behavior as frontend design evolves.

## Accessibility & Inclusion

- Main content must remain readable in a sans-serif typeface in both themes.
- Maintain responsive access to the public content and navigation on desktop and mobile.
- Preserve visible keyboard focus and operable navigation, theme controls, and contact interactions.
- Honor reduced-motion preferences and coarse/touch pointers. Cursor effects are supplementary; essential content and controls must remain usable without them.

## Owner refinements confirmed — 2026-10-15

- The owner requested alternatives to the all-green treatment before application. On 2026-10-16 they selected **Graphite + Emerald + Parchment** from the three separate review compositions. Broad surfaces become neutral graphite in dark mode and warm parchment in light mode; emerald marks actions and state, with sparse sand technical detail. The owner explicitly requires the latest public and dashboard layouts to remain. The single layout exception is the Overview traffic chart changing from bars to a line series. No factual copy or backend change belongs to this palette pass.
- Active education may display time elapsed between its existing start date and an estimated or exact end date. A full bar never establishes qualification completion; the owner extends the target or confirms the completed status. Existing records default to an estimated target without migration.
- The owner specifically requested a Discord reminder for exact education targets and confirmed reuse of the contact Worker's existing webhook. This authorizes a narrow scheduled-handler addition, a KV delivery ledger and an optional `endDatePrecision` field. No ImageKit record is needed. The supplied `felix_913` is a username; a numeric account ID is still needed for a direct mention. Local source is prepared; production activation requires Cloudflare authentication/configuration and has not occurred.
- Site Copy supports basic bold, italic and inline code in displayed headings/prose, with a dashboard preview. Identity, navigation, URLs and SEO inputs remain plain text. The underlying settings strings and existing save path are preserved.
