import * as React from "react";

// eslint-disable-next-line -- Workaround for https://github.com/webpack/webpack/issues/14814
const maybeUseInsertionEffect: typeof React.useLayoutEffect =
  (React as any)[`${"useInsertionEffect"}${""}`] ?? React.useLayoutEffect;

type WindowLike = Window & typeof globalThis;

export interface UseComponentCssInjection {
  id: string;
  css: string;
  window: WindowLike;
}

const windowSheetsMap = new WeakMap<
  WindowLike,
  Map<string, HTMLStyleElement>
>();
export function useComponentCssInjection({
  id,
  css,
  window: targetWindow,
}: UseComponentCssInjection): void {
  maybeUseInsertionEffect(() => {
    let sheetsMap =
      windowSheetsMap.get(targetWindow) ?? new Map<string, HTMLStyleElement>();
    let style = sheetsMap.get(id);

    if (!style) {
      style = targetWindow.document.createElement("style");
      style.setAttribute("type", "text/css");
      style.setAttribute("data-salt-style", id);
      style.textContent = css;

      targetWindow.document.head.appendChild(style);
    } else {
      style.textContent = css;
    }
    sheetsMap.set(id, style);
    windowSheetsMap.set(targetWindow, sheetsMap);

    return () => {
      const sheetsMap = windowSheetsMap.get(targetWindow);
      const style = sheetsMap?.get(id);
      if (style) {
        targetWindow.document.head.removeChild(style);
        sheetsMap?.delete(id);
      }
    };
  });
}
