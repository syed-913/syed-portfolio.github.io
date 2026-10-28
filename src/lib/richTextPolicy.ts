/** Preserve technical prose and code, without executable markup or document-level controls. */
export const richTextPolicy = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'link', 'meta', 'base'],
  FORBID_ATTR: ['style', 'id', 'name', 'srcset', 'target'],
  ALLOW_DATA_ATTR: false,
};
