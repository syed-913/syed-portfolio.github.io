export type IssuerIdentity = {
  canonical: string;
  mark: string;
  key: string;
};

const rules: Array<{ key: string; canonical: string; mark: string; aliases: RegExp[] }> = [
  {
    key: 'aws',
    canonical: 'Amazon Web Services',
    mark: 'AWS',
    aliases: [/\baws\b/i, /amazon\s+web\s+services/i, /amazon\s+aws/i],
  },
  {
    key: 'redhat',
    canonical: 'Red Hat',
    mark: 'RH',
    aliases: [/red\s*hat/i, /\brhce\b/i, /\brhcsa\b/i],
  },
  {
    key: 'hashicorp',
    canonical: 'HashiCorp',
    mark: 'HC',
    aliases: [/hashi\s*corp/i, /terraform/i, /vault/i],
  },
  {
    key: 'isc2',
    canonical: 'ISC2',
    mark: 'ISC²',
    aliases: [/\bisc\s*2\b/i, /\bisc²\b/i, /\bisc2\b/i],
  },
  {
    key: 'linux-foundation',
    canonical: 'The Linux Foundation',
    mark: 'LF',
    aliases: [/linux\s+foundation/i, /\blf\b/i],
  },
  {
    key: 'cncf',
    canonical: 'Cloud Native Computing Foundation',
    mark: 'CNCF',
    aliases: [/cloud\s+native\s+computing\s+foundation/i, /\bcncf\b/i],
  },
  {
    key: 'microsoft',
    canonical: 'Microsoft',
    mark: 'MS',
    aliases: [/microsoft/i, /azure/i],
  },
  {
    key: 'google-cloud',
    canonical: 'Google Cloud',
    mark: 'GCP',
    aliases: [/google\s+cloud/i, /\bgcp\b/i],
  },
  {
    key: 'cisco',
    canonical: 'Cisco',
    mark: 'CSCO',
    aliases: [/cisco/i],
  },
  {
    key: 'comptia',
    canonical: 'CompTIA',
    mark: 'CT',
    aliases: [/comp\s*tia/i],
  },
  {
    key: 'oracle',
    canonical: 'Oracle',
    mark: 'ORCL',
    aliases: [/oracle/i],
  },
  {
    key: 'al-nafi',
    canonical: 'Al Nafi',
    mark: 'AN',
    aliases: [/al\s*nafi/i],
  },
  {
    key: 'mastermind',
    canonical: 'Mastermind',
    mark: 'MM',
    aliases: [/mastermind/i],
  },
  {
    key: 'ibm',
    canonical: 'IBM',
    mark: 'IBM',
    aliases: [/\bibm\b/i],
  },
  {
    key: 'vmware',
    canonical: 'VMware',
    mark: 'VM',
    aliases: [/vmware/i, /broadcom\s+vmware/i],
  },
  {
    key: 'fortinet',
    canonical: 'Fortinet',
    mark: 'FTNT',
    aliases: [/fortinet/i],
  },
];

const initials = (value: string) => {
  const words = value
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return 'ID';
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase();
  return words.slice(0, 3).map(word => word[0]).join('').toUpperCase();
};

export const getIssuerIdentity = (issuer?: string): IssuerIdentity => {
  const raw = issuer?.trim() || 'Credential authority';
  const matched = rules.find(rule => rule.aliases.some(alias => alias.test(raw)));

  if (matched) {
    return { canonical: matched.canonical, mark: matched.mark, key: matched.key };
  }

  return {
    canonical: raw,
    mark: initials(raw),
    key: 'generic',
  };
};
