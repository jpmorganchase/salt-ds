import * as React from "react";

// eslint-disable-next-line -- Workaround for https://github.com/webpack/webpack/issues/14814
const maybeUseInsertionEffect: typeof React.useLayoutEffect =
  (React as any)[`${"useInsertionEffect"}${""}`] ?? React.useLayoutEffect;

type WindowLike = Window & typeof globalThis;

export interface UseComponentCssInjection {
  id?: string;
  css: string;
  window?: WindowLike;
}

type StyleElementMap = Map<
  string,
  { styleElement: HTMLStyleElement | null; count: number }
>;

const windowSheetsMap = new WeakMap<WindowLike, StyleElementMap>();
export function useComponentCssInjection({
  id: idProp,
  css,
  window: targetWindow,
}: UseComponentCssInjection): void {
  const id = css;

  maybeUseInsertionEffect(() => {
    if (!targetWindow) {
      return;
    }

    let sheetsMap = windowSheetsMap.get(targetWindow) ?? new Map();
    let styleMap = sheetsMap.get(id) ?? { styleElement: null, count: 0 };

    if (styleMap.styleElement == null) {
      styleMap.styleElement = targetWindow.document.createElement("style");
      styleMap.styleElement.setAttribute("type", "text/css");
      styleMap.styleElement.setAttribute("data-salt-style", idProp || "");
      styleMap.styleElement.textContent = css;

      styleMap.count = 1;

      targetWindow.document.head.insertBefore(
        styleMap.styleElement,
        targetWindow.document.head.firstChild
      );
    } else {
      styleMap.styleElement.textContent = css;
      styleMap.count++;
    }
    sheetsMap.set(id, styleMap);
    windowSheetsMap.set(targetWindow, sheetsMap);

    return () => {
      const sheetsMap = windowSheetsMap.get(targetWindow);
      const styleMap = sheetsMap?.get(id);
      if (styleMap?.styleElement) {
        styleMap.count--;
        if (styleMap.count < 1) {
          targetWindow.document.head.removeChild(styleMap.styleElement);
          styleMap.styleElement = null;
          sheetsMap?.delete(id);
        }
      }
    };
  }, [id, css, targetWindow]);
}
