type DeprecationOptions = {
  /** Unique key to ensure the warning only logs once per runtime. */
  key: string;
  /** The message to show in the warning. */
  message: string;
};

const warnedKeys = new Set<string>();

/**
 * Log a deprecation warning once (per key) in development builds.
 */
export const warnOnce = ({ key, message }: DeprecationOptions) => {
  if (process.env.NODE_ENV === "production") return;
  if (warnedKeys.has(key)) return;
  warnedKeys.add(key);

  // eslint-disable-next-line no-console
  console.warn(message);
};

