import * as React from "react";
import { useCSPNonce } from "../csp-provider";
import { useStyleInjection } from "../style-injection-provider";
import { useInsertionPoint } from "./InsertionPointProvider";

/* Workaround for https://github.com/webpack/webpack/issues/14814#issuecomment-1536757985 */
const maybeUseInsertionEffect: typeof React.useLayoutEffect =
  // biome-ignore lint/suspicious/noExplicitAny: see comment above
  (React as any)["useInsertionEffect".toString()] ?? React.useLayoutEffect;

export interface UseComponentCssInjection {
  testId?: string;
  css: string;
  nonce?: string;
  window?: Window | null;
}

type StyleElementMap = Map<
  string,
  { styleElement: HTMLStyleElement | null; count: number }
>;

// windowSheetsMap maps window objects to StyleElementMaps
// A StyleElementMap maps style keys to style element tags
const windowSheetsMap = new WeakMap<Window, StyleElementMap>();

function getStyleKey(css: string, nonce?: string) {
  return JSON.stringify([nonce ?? null, css]);
}

export function useComponentCssInjection({
  testId,
  css,
  nonce: nonceProp,
  window: targetWindow,
}: UseComponentCssInjection): void {
  const styleInjectionEnabled = useStyleInjection();
  const insertionPoint = useInsertionPoint();
  const nonce = useCSPNonce(nonceProp);

  maybeUseInsertionEffect(() => {
    if (!targetWindow || !styleInjectionEnabled) {
      return;
    }

    const styleKey = getStyleKey(css, nonce);

    const sheetsMap =
      windowSheetsMap.get(targetWindow) ??
      new Map<
        string,
        { styleElement: HTMLStyleElement | null; count: number }
      >();
    const styleMap = sheetsMap.get(styleKey) ?? {
      styleElement: null,
      count: 0,
    };

    if (styleMap.styleElement == null) {
      styleMap.styleElement = targetWindow.document.createElement("style");
      styleMap.styleElement.setAttribute("type", "text/css");
      styleMap.styleElement.setAttribute("data-salt-style", testId || "");
      if (nonce) {
        styleMap.styleElement.nonce = nonce;
      }
      styleMap.styleElement.textContent = css;

      styleMap.count = 1;

      targetWindow.document.head.insertBefore(
        styleMap.styleElement,
        insertionPoint || targetWindow.document.head.firstChild,
      );
    } else {
      // The map is keyed by the CSS string, so an existing style element
      // already contains this CSS and only the reference count needs updating.
      styleMap.count++;
    }
    sheetsMap.set(styleKey, styleMap);
    windowSheetsMap.set(targetWindow, sheetsMap);

    return () => {
      const sheetsMap = windowSheetsMap.get(targetWindow);
      const styleMap = sheetsMap?.get(styleKey);
      if (styleMap?.styleElement) {
        styleMap.count--;
        if (styleMap.count < 1) {
          styleMap.styleElement.remove();
          styleMap.styleElement = null;
          sheetsMap?.delete(styleKey);
          if (sheetsMap?.size === 0) {
            windowSheetsMap.delete(targetWindow);
          }
        }
      }
    };
  }, [testId, css, nonce, targetWindow, styleInjectionEnabled, insertionPoint]);
}
