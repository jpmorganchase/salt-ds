import type { Locator } from "@vitest/browser/context";
import type { SyntheticEvent } from "react";

export function pasteValue(locator: Locator, value: string) {
  const input = locator.element() as HTMLInputElement;
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )?.set;

  if (!nativeInputValueSetter) {
    throw new Error(
      "The browser does not expose the native input value setter",
    );
  }

  nativeInputValueSetter.call(input, value);
  input.dispatchEvent(
    new Event("input", {
      bubbles: true,
      composed: true,
    }),
  );
}

export function dropFiles(locator: Locator, files: File[]) {
  const dataTransfer = new DataTransfer();
  for (const file of files) {
    dataTransfer.items.add(file);
  }

  return locator.element().dispatchEvent(
    new DragEvent("drop", {
      bubbles: true,
      cancelable: true,
      dataTransfer,
    }),
  );
}

// React 16 pools synthetic events, so keep the native events instead.
export function trackNativeEvents<T extends Event = Event>() {
  const nativeEvents: T[] = [];

  return {
    handler: (event: SyntheticEvent<Element, T>) => {
      nativeEvents.push(event.nativeEvent);
    },
    last: () => nativeEvents.at(-1),
  };
}

/**
 * Records the native events behind the React events passed to the returned
 * handler, so a test can assert whether a component called `preventDefault`.
 *
 * The value has to be read from the native event rather than the React
 * synthetic event: React 16 pools synthetic events and nulls their properties
 * once the handler returns, so reading `defaultPrevented` from a retained
 * synthetic event gives `null` there. The underlying DOM event is not pooled,
 * and React forwards `preventDefault` to it on every version.
 */
export function trackDefaultPrevented() {
  const nativeEvents: Event[] = [];

  return {
    handler: (event: SyntheticEvent) => {
      nativeEvents.push(event.nativeEvent);
    },
    /** Whether the most recently handled event had its default prevented. */
    lastDefaultPrevented: () => nativeEvents.at(-1)?.defaultPrevented,
    handledCount: () => nativeEvents.length,
  };
}
