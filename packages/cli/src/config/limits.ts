export const SALT_SCAN_LIMIT_DEFAULTS = {
  traversal_depth: 32,
  visited_directories: 10_000,
  directory_entries: 100_000,
  queued_paths: 25_000,
  selected_files: 5_000,
  selected_aggregate_bytes: 50 * 1024 * 1024,
  individual_source_bytes: 1024 * 1024,
  discovery_elapsed_ms: 15_000,
  js_ast_nodes_per_file: 250_000,
  css_nodes_per_file: 100_000,
  evidence_candidates_per_file: 25_000,
  findings_per_file: 500,
  worker_concurrency: 2,
  worker_deadline_ms: 5_000,
  worker_old_generation_mib: 128,
  forced_worker_restarts: 8,
  cumulative_worker_wall_ms: 15 * 60 * 1000,
  whole_scan_elapsed_ms: 10 * 60 * 1000,
  canonical_result_bytes: 2 * 1024 * 1024,
} as const;

export const SALT_SCAN_LIMIT_CEILINGS = {
  traversal_depth: 64,
  visited_directories: 50_000,
  directory_entries: 250_000,
  queued_paths: 100_000,
  selected_files: 20_000,
  selected_aggregate_bytes: 200 * 1024 * 1024,
  individual_source_bytes: 5 * 1024 * 1024,
  discovery_elapsed_ms: 60_000,
  js_ast_nodes_per_file: 1_000_000,
  css_nodes_per_file: 500_000,
  evidence_candidates_per_file: 100_000,
  findings_per_file: 2_000,
  worker_concurrency: 4,
  worker_deadline_ms: 10_000,
  worker_old_generation_mib: 256,
  forced_worker_restarts: 32,
  cumulative_worker_wall_ms: 60 * 60 * 1000,
  whole_scan_elapsed_ms: 30 * 60 * 1000,
  canonical_result_bytes: 8 * 1024 * 1024,
} as const;

export type SaltScanLimitName = keyof typeof SALT_SCAN_LIMIT_DEFAULTS;
export type SaltScanLimits = Record<SaltScanLimitName, number>;

export const SALT_SCAN_LIMIT_NAMES = Object.freeze(
  Object.keys(SALT_SCAN_LIMIT_DEFAULTS) as SaltScanLimitName[],
);
