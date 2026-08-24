import type { Locator } from "@vitest/browser/context";

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
