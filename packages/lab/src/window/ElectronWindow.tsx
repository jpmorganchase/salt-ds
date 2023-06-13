import {
  SaltProvider,
  useForkRef,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { isDesktop, Window as SaltWindow, WindowProps } from "../window";

import { useWindowParentContext, WindowParentContext } from "./desktop-utils";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import electronWindowCss from "./ElectronWindow.css";

const Window = forwardRef<HTMLDivElement, WindowProps>(function ElectronWindow(
  { className, children, id = "dialog", open = true, style = {}, ...rest },
  forwardedRef
): JSX.Element | null {
  const { top, left, position, ...styleRest } = style;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-electron-window",
    css: electronWindowCss,
    window: targetWindow,
  });

  const [mountNode, setMountNode] = useState<Element | null>(null);
  const [windowRef, setWindowRef] = useState<Window | null>(null);
  const windowRoot = useRef<HTMLDivElement>(null);

  const forkedRef = useForkRef(forwardedRef, windowRoot);

  if (!mountNode) {
    const win = window.open("", id);
    (win as Window).document.write(
      // eslint-disable-next-line no-restricted-globals
      `<html lang="en"><head><title>${id}</title><base href="${location.origin}"><style>body {margin: 0;}</style></head><body></body></html>`
    );
    document.head.querySelectorAll("style").forEach((htmlElement) => {
      (win as Window).document.head.appendChild(htmlElement.cloneNode(true));
    });
    const bodyElement = (win as Window).document.body;
    setMountNode(bodyElement);
    setWindowRef(win);
  }

  const parentWindow = useWindowParentContext();

  const closeWindow = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { ipcRenderer } = global as any;
    if (ipcRenderer) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      ipcRenderer.send("window-close", { id: id });
    }
  }, [id]);

  // The timeout is required to give the Dialog component time to report the correct height
  // otherwise the window will be smaller than expected
  useEffect(() => {
    setTimeout(() => {
      if (windowRoot.current) {
        // @ts-ignore
        const { scrollHeight: height, scrollWidth: width } = windowRoot.current;
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { ipcRenderer } = global as any;
        if (ipcRenderer) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
          ipcRenderer.send("window-size", {
            id: id,
            height: Math.ceil(height + 1),
            width: Math.ceil(width + 1),
          });
        }
      }
    }, 80);
  });

  // The timeout is required to allow the window time to be moved into position and scaled
  // before being shown to the user,
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { ipcRenderer } = global as any;
    if (ipcRenderer) {
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        ipcRenderer.send("window-ready", { id: id });
      }, 100);
    }

    return () => {
      closeWindow();
    };
  }, [closeWindow, windowRef, id]);

  // The timeout is required to give the Dialog component time to report the correct height
  // otherwise the window will be smaller than expected
  useIsomorphicLayoutEffect(() => {
    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { ipcRenderer } = global as any;
      if (ipcRenderer) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        ipcRenderer.send("window-position", {
          id: id,
          parentWindowID: parentWindow.id,
          left: style.left,
          top: style.top,
        });
      }
    }, 90);
  }, [style]);

  return mountNode
    ? ReactDOM.createPortal(
        <SaltProvider>
          <WindowParentContext.Provider
            value={{
              top: (style.top as number) + parentWindow.top,
              left: (style.left as number) + parentWindow.left,
              id: id,
            }}
          >
            <div className="saltWindow" ref={forkedRef}>
              <div className={className} style={{ ...styleRest }} {...rest}>
                {children}
              </div>
            </div>
          </WindowParentContext.Provider>
        </SaltProvider>,
        mountNode
      )
    : null;
});

export const ElectronWindow = isDesktop ? Window : SaltWindow;
