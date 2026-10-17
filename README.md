# Syed Ammar — Linux, Cloud & Security

Personal portfolio at [syedammar.engineer](https://syedammar.engineer), built with React, TypeScript and Vite. Public projects, credentials, writing and experience come from the existing Firebase project. The private content dashboard is available at `/dashboard` through Firebase Authentication.

## Development

Use Node 22 (at least 22.18), as recorded in `.nvmrc`.

```sh
nvm use
npm ci
cp .env.example .env.local
```

Fill the ignored local environment file with the existing Firebase web configuration and public Cloudflare proxy URLs, then run `npm run dev`. Keep real Discord, Gemini, ImageKit and Cloudflare credentials in the corresponding server service's secret storage.

## Release

```sh
npm run release:check
```

This validates the production environment, runs the focused tests, type-checks, builds, generates public route metadata from Firebase and checks the final `dist` artifact. Public content reads must succeed during a release check. `./deploy.sh` runs the same checks and shows Git status; it does not commit, push or deploy.

**Follow [the deployment guide](docs/DEPLOYMENT.md) before pushing.** GitHub Pages deploys the validated static artifact after a push to `main`; it does not deploy Firebase, ImageKit or any Cloudflare Worker. Pull requests run tests and TypeScript checks without production secrets.

The earlier [redesign overlay](README-REDESIGN.md) and [v15 SEO notes](README-V15.md) are historical documents. The deployment guide describes the current workflow and settings. Optional education reminder setup is documented separately in [the Worker guide](workers/README-education-reminders.md).
