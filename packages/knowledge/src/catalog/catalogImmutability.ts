export function deepFreezeCatalogValue<T>(value: T): T {
  const visited = new WeakSet<object>();

  const freeze = (candidate: unknown): void => {
    if (
      candidate === null ||
      typeof candidate !== "object" ||
      visited.has(candidate)
    ) {
      return;
    }

    // Catalog records and projections are JSON-shaped. Avoid applying
    // Object.freeze to non-empty typed-array views if one is ever introduced,
    // because JavaScript engines reject that operation.
    if (ArrayBuffer.isView(candidate)) {
      return;
    }

    visited.add(candidate);
    for (const key of Reflect.ownKeys(candidate)) {
      const descriptor = Object.getOwnPropertyDescriptor(candidate, key);
      if (descriptor && "value" in descriptor) {
        freeze(descriptor.value);
      }
    }
    Object.freeze(candidate);
  };

  freeze(value);
  return value;
}
