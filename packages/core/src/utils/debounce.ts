export interface Cancelable {
  clear(): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  // Corresponds to 10 frames at 60 Hz.
  wait = 166,
  leading = false
): T & Cancelable {
  let timeout: number;
  const debounced: T & Cancelable = function debounced(
    this: typeof debounced,
    ...args
  ) {
    const later = () => {
      func.apply(this, args);
    };
    clearTimeout(timeout);
    if (leading) {
      later();
    }
    timeout = window.setTimeout(later, wait);
  } as T & Cancelable;

  debounced.clear = () => {
    clearTimeout(timeout);
  };

  return debounced;
}
