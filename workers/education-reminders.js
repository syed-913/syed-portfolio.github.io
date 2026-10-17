import { educationTimeline } from '../src/lib/education.ts';

const valueOf = (fields, name) => fields[name]?.stringValue;

/** Scheduled only: never runs from a public page or the contact POST handler. */
export async function sendEducationReminders(env, now = Date.now(), fetcher = fetch) {
  if (!env.EDUCATION_REMINDERS || !env.FIREBASE_PROJECT_ID || !env.FIREBASE_API_KEY || !env.DISCORD_WEBHOOK_URL) {
    throw new Error('Education reminders need the KV binding, Firebase public configuration, and the existing Discord webhook secret.');
  }
  if (!/^[a-z][a-z0-9-]{4,61}[a-z0-9]$/.test(env.FIREBASE_PROJECT_ID)) throw new Error('Invalid Firebase project ID.');
  const endpoint = new URL(`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`);
  endpoint.searchParams.set('key', env.FIREBASE_API_KEY);
  const response = await fetcher(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery: {
      from: [{ collectionId: 'certificates' }],
      where: { fieldFilter: { field: { fieldPath: 'visible' }, op: 'EQUAL', value: { booleanValue: true } } },
      select: { fields: ['name', 'institution', 'entryType', 'educationStatus', 'startDate', 'endDate', 'endDatePrecision', 'visible'].map(fieldPath => ({ fieldPath })) },
    } }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Education read failed (${response.status}). No reminders were sent.`);
  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error('Unexpected education query response.');

  const userId = /^[0-9]{17,20}$/.test(env.DISCORD_USER_ID || '') ? env.DISCORD_USER_ID : null;
  let sent = 0, skipped = 0;
  const failures = [];
  for (const row of rows) {
    const document = row.document;
    if (!document) continue;
    const fields = document.fields || {};
    const entry = Object.fromEntries(['name', 'institution', 'entryType', 'educationStatus', 'startDate', 'endDate', 'endDatePrecision'].map(key => [key, valueOf(fields, key)]));
    if (fields.visible?.booleanValue !== true || entry.entryType !== 'education' || entry.educationStatus !== 'in_progress' || entry.endDatePrecision !== 'exact' || !educationTimeline(entry, now)?.reached) { skipped++; continue; }
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${document.name}|${entry.endDate}`));
    const reminderKey = `education:${Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')}`;
    try {
      if (await env.EDUCATION_REMINDERS.get(reminderKey)) { skipped++; continue; }
      const discord = await fetcher(env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: userId ? `<@${userId}> Your education timeline has reached its target date.` : 'Your education timeline has reached its target date.',
          allowed_mentions: { parse: [], users: userId ? [userId] : [] },
          embeds: [{
            title: 'Education completion check',
            description: 'Review this learning entry. Extend the expected end date, or confirm completion and update its public status in your dashboard.',
            color: 0x008969,
            fields: [
              { name: 'Program', value: (entry.name || 'Education entry').slice(0, 1024) },
              { name: 'Institution', value: (entry.institution || 'Not specified').slice(0, 1024) },
              { name: 'Target date', value: entry.endDate },
            ],
            url: 'https://syedammar.engineer/dashboard',
            footer: { text: 'Elapsed time does not automatically mark the education complete.' },
            timestamp: new Date(now).toISOString(),
          }],
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!discord.ok) throw new Error(`Discord delivery failed (${discord.status}).`);
      // Mark only after successful delivery. A changed date gets its own key.
      await env.EDUCATION_REMINDERS.put(reminderKey, new Date(now).toISOString());
      sent++;
    } catch (error) { failures.push(error); }
  }
  if (failures.length) throw new AggregateError(failures, `${failures.length} education reminders need a retry.`);
  return { sent, skipped };
}
