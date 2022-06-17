import {
  ToolkitProvider,
  useForkRef,
  useIsomorphicLayoutEffect,
  Window as ToolkitWindow,
  windowType,
} from "@jpmorganchase/uitk-core";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { isElectron, useProxyRef } from "./electron-utils";

import "./ElectronWindow.css";

const Window: windowType = forwardRef(function ElectronWindow(
  { children, id = "dialog", open = true, style = { top: 0, left: 0 } },
  forwardedRef
) {
  const [mountNode, setMountNode] = useState<Element | null>(null);
  const [windowRef, setWindowRef] = useState<Window | null>(null);
  const windowRoot = useRef<HTMLDivElement>(null);

  const forkedRef = useForkRef(useProxyRef(forwardedRef), windowRoot);

  if (!mountNode) {
    const win = window.open("", id);
    (win as Window).document.write(
      `<html lang="en"><head><title>${id}</title><base href="${location.origin}"><style>body {margin: 0;}</style></head><body></body></html>`
    );
    document.head.querySelectorAll("link, style").forEach((htmlElement) => {
      (win as Window).document.head.appendChild(htmlElement.cloneNode(true));
    });
    const bodyElement = (win as Window).document.body;
    setMountNode(bodyElement);
    setWindowRef(win);
  }

  const closeWindow = useCallback(() => {
    const { ipcRenderer } = global as any;
    if (ipcRenderer) {
      ipcRenderer.send("window-close", { id });
    }
  }, [id]);

  useEffect(() => {
    const { ipcRenderer } = global as any;
    if (ipcRenderer) {
      ipcRenderer.send("window-ready", { id });
    }
    return () => {
      closeWindow();
    };
  }, [closeWindow, windowRef]);

  useIsomorphicLayoutEffect(() => {
    const { ipcRenderer } = global as any;
    if (ipcRenderer) {
      ipcRenderer.send("window-position", {
        id,
        left: style.left,
        top: style.top,
      });
    }
  }, [id, style]);

  useIsomorphicLayoutEffect(() => {
    if (windowRoot.current) {
      const { scrollHeight: height, scrollWidth: width } = windowRoot.current;
      const { ipcRenderer } = global as any;
      if (ipcRenderer) {
        ipcRenderer.send("window-size", {
          id,
          height: Math.ceil(height),
          width: Math.ceil(width),
        });
      }
    }
  }, [id]);

  return mountNode
    ? ReactDOM.createPortal(
        <ToolkitProvider>
          <div className="uitkWindow" ref={forkedRef}>
            {children}
          </div>
        </ToolkitProvider>,
        mountNode
      )
    : null;
});

export const ElectronWindow = isElectron ? Window : ToolkitWindow;
