import * as React from "react";

// eslint-disable-next-line -- Workaround for https://github.com/webpack/webpack/issues/14814
const maybeUseInsertionEffect: typeof React.useLayoutEffect =
  (React as any)[`${"useInsertionEffect"}${""}`] ?? React.useLayoutEffect;

const isInserted = new Set<string>();
export interface UseComponentCssInjection {
  id: string;
  css: string;
  window: Window & typeof globalThis;
}
export function useComponentCssInjection({
  id,
  css,
  window: targetWindow,
}: UseComponentCssInjection): void {
  maybeUseInsertionEffect(() => {
    if (!isInserted.has(id)) {
      const style = targetWindow.document.createElement("style");
      style.setAttribute("data-meta", id);
      style.textContent = css;
      targetWindow.document.head.appendChild(style);
    }
    return () => {
      targetWindow.document.head
        .querySelector(`style[data-meta="${id}"]`)
        ?.remove();
    };
  });
}
