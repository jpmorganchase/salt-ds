/**
 * Tiny bounded LRU for parsed registry artifacts.
 *
 * Keyed by absolute artifact path **plus the file's mtimeMs at parse
 * time** so multiple `loadRegistry()` calls targeting the same directory
 * in the same process reuse parsed JSON, while a rewritten file
 * (e.g. tests that regenerate fixtures mid-run, or a long-running MCP
 * host that picks up a registry rebuild) transparently misses the cache
 * and re-parses from disk.
 *
 * Capacity is deliberately small (64 by default): real-world consumers
 * load at most a handful of registry dirs in one process (typically 1).
 * The cap is here so a long-running MCP host that resolves many
 * `registryDir` overrides cannot grow unbounded.
 *
 * Intentionally process-local — there is no cross-process or on-disk
 * sharing. Sync API mirrors the sync property-touch reads in
 * `lazyRegistry.ts`.
 */

interface CacheEntry<T> {
  value: T;
  mtimeMs: number;
}

const DEFAULT_CAPACITY = 64;

let cache = new Map<string, CacheEntry<unknown>>();
let capacity = DEFAULT_CAPACITY;

/**
 * Returns the cached value at `absolutePath` only if the cached entry
 * was parsed from the same on-disk version of the file (matched by
 * mtimeMs). A stale or absent entry returns `undefined` so the caller
 * re-reads from disk and re-populates the cache.
 */
export function getCachedArtifact<T>(
  absolutePath: string,
  currentMtimeMs: number,
): T | undefined {
  const entry = cache.get(absolutePath) as CacheEntry<T> | undefined;
  if (!entry) {
    return undefined;
  }
  if (entry.mtimeMs !== currentMtimeMs) {
    // File changed on disk; invalidate this entry so the next set call
    // refreshes it (and so we never serve a stale parse).
    cache.delete(absolutePath);
    return undefined;
  }
  // Refresh recency: delete + re-set so insertion order tracks usage.
  cache.delete(absolutePath);
  cache.set(absolutePath, entry as CacheEntry<unknown>);
  return entry.value;
}

export function setCachedArtifact<T>(
  absolutePath: string,
  value: T,
  mtimeMs: number,
): void {
  if (cache.has(absolutePath)) {
    cache.delete(absolutePath);
  }
  cache.set(absolutePath, { value, mtimeMs } as CacheEntry<unknown>);
  while (cache.size > capacity) {
    const oldest = cache.keys().next().value as string | undefined;
    if (oldest === undefined) {
      break;
    }
    cache.delete(oldest);
  }
}

export function clearArtifactCache(): void {
  cache = new Map();
}

export function configureArtifactCache(options: {
  capacity?: number;
}): void {
  if (typeof options.capacity === "number" && options.capacity > 0) {
    capacity = options.capacity;
    while (cache.size > capacity) {
      const oldest = cache.keys().next().value as string | undefined;
      if (oldest === undefined) {
        break;
      }
      cache.delete(oldest);
    }
  }
}

export function getArtifactCacheStatsForTests(): {
  size: number;
  capacity: number;
  keys: string[];
} {
  return {
    size: cache.size,
    capacity,
    keys: [...cache.keys()],
  };
}


