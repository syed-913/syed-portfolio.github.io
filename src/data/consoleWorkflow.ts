export const consoleWorkflow = [
  { name: 'Import', caption: 'Parse CSV/JSON imports and inspect account data.', detail: 'Review imported account data before it reaches system files. The console accepts bulk CSV and JSON input.' },
  { name: 'Validate', caption: 'Check for policy compliance, duplicates, and required fields.', detail: 'Validation checks input and account policy before changes. A dry run lets you inspect the intended operations.' },
  { name: 'Commit', caption: 'Apply approved changes to the system.', detail: 'Transactional account changes include rollback and crash recovery. The project implements Linux account lifecycle operations in Bash.' },
  { name: 'Audit', caption: 'Inspect account configuration and review change records.', detail: 'CIS-mapped checks inspect account configuration. Transaction history and hash-chained JSONL logs record changes, with structured journald logging where available. Read the repository for implementation and test evidence.' },
];
