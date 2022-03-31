import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

import { ToolkitProvider, useIsomorphicLayoutEffect } from "@brandname/core";
import { windowType, Window as ToolkitWindow } from "./WindowContext";
import { useForkRef } from "../utils";
import { getChildrenNames, isElectron } from "./electron-utils";

import "./ElectronWindow.css";
import ReactDOMServer from "react-dom/server";
import {
  useWindowParentContext,
  useWindowParentPositionContext,
  WindowParentContext,
  WindowParentPositionContext,
} from "./desktop-utils";

const Window: windowType = forwardRef(function ElectronWindow(
  {
    className,
    children,
    id = "dialog",
    open = true,
    style = { top: 0, left: 0 },
    ...rest
  },
  forwardedRef
) {
  const [mountNode, setMountNode] = useState<Element | null>(null);
  const [windowRef, setWindowRef] = useState<Window | null>(null);
  const windowRoot = useRef<HTMLDivElement>(null);

  const forkedRef = useForkRef(forwardedRef, windowRoot);

  const components = new Set();
  getChildrenNames(children, components);

  const test = ReactDOMServer.renderToStaticMarkup(<>{children}</>);

  const dummyEl = document.createElement("html");
  dummyEl.innerHTML = test;

  dummyEl.querySelectorAll("[class]").forEach((element) =>
    element.classList
      .toString()
      .split(" ")
      .forEach((classname) => components.add(classname))
  );
  //Window Styles
  components.add(".uitkWindow");
  //Theme
  components.add(".uitk-light");
  components.add(".uitk-density");
  //Fonts
  components.add("@font-face");

  components.add(".uitkOverflowMenu");

  const parentStyle = useWindowParentPositionContext();
  console.log(parentStyle);

  if (className)
    className.split(" ").forEach((classname) => components.add(classname));

  function resizeWindow() {
    if (windowRoot.current) {
      // @ts-ignore
      const { scrollHeight: height, scrollWidth: width } = windowRoot.current;
      const { ipcRenderer } = global as any;
      if (ipcRenderer) {
        ipcRenderer.send("window-size", {
          id: id,
          height: Math.ceil(height + 1),
          width: Math.ceil(width + 1),
        });
      }
    }
  }

  if (!mountNode) {
    const win = window.open("", id);
    (win as Window).document.write(
      `<html lang="en"><head><title>${id}</title><base href="${location.origin}"><style>body {margin: 0;}</style></head><body></body></html>`
    );
    document.head.querySelectorAll("style").forEach((htmlElement) => {
      if (
        // @ts-ignore
        Array.from(components).some((v) => htmlElement.textContent.includes(v))
      ) {
        (win as Window).document.head.appendChild(htmlElement.cloneNode(true));
      }
    });
    const bodyElement = (win as Window).document.body;
    setMountNode(bodyElement);
    setWindowRef(win);
    // @ts-ignore
    new MutationObserver(() => {
      resizeWindow();
    }).observe(bodyElement, {
      attributes: false,
      characterData: true,
      childList: true,
      subtree: true,
    });
  }

  const parentWindow = useWindowParentContext();

  const closeWindow = useCallback(() => {
    const { ipcRenderer } = global as any;
    if (ipcRenderer) {
      ipcRenderer.send("window-close", { id: id });
    }
  }, [id]);

  useEffect(() => {
    const { ipcRenderer } = global as any;
    if (ipcRenderer) {
      ipcRenderer.send("window-ready", { id: id });
    }

    return () => {
      closeWindow();
    };
  }, [closeWindow, windowRef]);

  useIsomorphicLayoutEffect(() => {
    const { ipcRenderer } = global as any;
    if (ipcRenderer) {
      let offsetX = parentStyle.left;
      let offsetY = parentStyle.top;
      if (parentWindow) {
        offsetX = parentWindow.screenLeft - window.screenLeft;
        // Will need a dynamic way to account for the window frame
        offsetY = parentWindow.screenTop - window.screenTop - 26;
      }
      console.log(`${id} is being moved to ${style.left + offsetX},${style.top + offsetY}`);
      ipcRenderer.send("window-position", {
        id: id,
        left: style.left + offsetX,
        top: style.top + offsetY,
      });
    }
  },[style]);

  return mountNode
    ? ReactDOM.createPortal(
        <ToolkitProvider>
          <WindowParentContext.Provider value={windowRef}>
            <WindowParentPositionContext.Provider
              value={{
                top: style.top + parentStyle.top,
                left: style.left + parentStyle.left,
              }}
            >
              <div className="uitkWindow" ref={forkedRef}>
                <div className={className} {...rest}>
                  {children}
                </div>
              </div>
            </WindowParentPositionContext.Provider>
          </WindowParentContext.Provider>
        </ToolkitProvider>,
        mountNode
      )
    : null;
});

export const ElectronWindow = isElectron ? Window : ToolkitWindow;
