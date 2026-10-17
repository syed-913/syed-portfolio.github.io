// Optional entry point for the EXISTING contact Worker, enabled only after setup.
// The normal contact entry point remains usable without reminder bindings.
import contactWorker from '../cloudflare-worker.js';
import { sendEducationReminders } from './education-reminders.js';

export default {
  fetch: contactWorker.fetch,
  scheduled(controller, env, ctx) {
    ctx.waitUntil(sendEducationReminders(env, controller.scheduledTime));
  },
};
