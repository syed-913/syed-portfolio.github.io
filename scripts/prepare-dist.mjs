import fs from 'node:fs/promises';
import path from 'node:path';

// Provenance stays alongside source assets in Git, outside the deployed website.
// These files are authored tool metadata, never application data.
let removed = 0;
async function visit(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await visit(file);
    else if (/\.(?:png|webp|jpe?g|avif)\.json$/i.test(entry.name)) {
      await fs.unlink(file);
      removed++;
    }
  }
}
await visit('dist');
await fs.writeFile('dist/.nojekyll', '');
console.log(`[dist] Prepared static artifact; excluded ${removed} source-only image metadata file(s).`);
