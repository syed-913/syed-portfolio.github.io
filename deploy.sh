#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

# Prepare and validate only. Review, commit and push remain explicit owner actions.
npm run release:check
git diff --check
git status --short
printf '\nRelease checks passed. Review the changes, commit, then push your chosen branch.\n'
printf 'GitHub Pages deploys on main through .github/workflows/deploy.yml.\n'
printf 'See docs/DEPLOYMENT.md for settings, push steps and post-deploy checks.\n'
