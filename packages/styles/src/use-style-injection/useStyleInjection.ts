import * as React from "react";
import { useInsertionPoint } from "./InsertionPointProvider";
import { useStyleInjection } from "../style-injection-provider";

/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any -- Workaround for https://github.com/webpack/webpack/issues/14814#issuecomment-1536757985 */
const maybeUseInsertionEffect: typeof React.useLayoutEffect =
  (React as any)["useInsertionEffect".toString()] ?? React.useLayoutEffect;
/* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

export interface UseComponentCssInjection {
  testId?: string;
  css: string;
  window?: Window | null;
}

type StyleElementMap = Map<
  string,
  { styleElement: HTMLStyleElement | null; count: number }
>;

// windowSheetsMap maps window objects to StyleElementMaps
// A StyleElementMap maps css strings to style element tags
const windowSheetsMap = new WeakMap<Window, StyleElementMap>();

export function useComponentCssInjection({
  testId,
  css,
  window: targetWindow,
}: UseComponentCssInjection): void {
  const styleInjectionEnabled = useStyleInjection();
  const insertionPoint = useInsertionPoint();

  maybeUseInsertionEffect(() => {
    if (!targetWindow || !styleInjectionEnabled) {
      return;
    }

    const sheetsMap =
      windowSheetsMap.get(targetWindow) ??
      new Map<
        string,
        { styleElement: HTMLStyleElement | null; count: number }
      >();
    const styleMap = sheetsMap.get(css) ?? { styleElement: null, count: 0 };

    if (styleMap.styleElement == null) {
      styleMap.styleElement = targetWindow.document.createElement("style");
      styleMap.styleElement.setAttribute("type", "text/css");
      styleMap.styleElement.setAttribute("data-salt-style", testId || "");
      styleMap.styleElement.textContent = css;

      styleMap.count = 1;

      targetWindow.document.head.insertBefore(
        styleMap.styleElement,
        insertionPoint || targetWindow.document.head.firstChild
      );
    } else {
      styleMap.styleElement.textContent = css;
      styleMap.count++;
    }
    sheetsMap.set(css, styleMap);
    windowSheetsMap.set(targetWindow, sheetsMap);

    return () => {
      const sheetsMap = windowSheetsMap.get(targetWindow);
      const styleMap = sheetsMap?.get(css);
      if (styleMap?.styleElement) {
        styleMap.count--;
        if (styleMap.count < 1) {
          targetWindow.document.head.removeChild(styleMap.styleElement);
          styleMap.styleElement = null;
          sheetsMap?.delete(css);
        }
      }
    };
  }, [testId, css, targetWindow]);
}
