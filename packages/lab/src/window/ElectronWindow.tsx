import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import ReactDOM from "react-dom";

import { ToolkitProvider, useIsomorphicLayoutEffect } from "@brandname/core";
import { windowType, Window as ToolkitWindow } from "./WindowContext";
import { useForkRef } from "../utils";
import { getChildrenNames, isElectron } from "./electron-utils";

import "./ElectronWindow.css";
import ReactDOMServer from "react-dom/server";
import {
  useWindowParentContext,
  WindowParentContext,
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
  //Need to manually add styles to the list

  //Window Styles
  components.add(".uitkWindow");
  //Theme
  components.add(".uitk-light");
  components.add(".uitk-density");
  //Fonts
  components.add("@font-face");

  //Overflow menu is added post initial render
  components.add(".uitkOverflowMenu");

  if (className)
    className.split(" ").forEach((classname) => components.add(classname));

  if (!mountNode) {
    const win = window.open("", id);
    (win as Window).document.write(
      // eslint-disable-next-line no-restricted-globals
      `<html lang="en"><head><title>${id}</title><base href="${location.origin}"><style>body {margin: 0;}</style></head><body></body></html>`
    );
    document.head.querySelectorAll("style").forEach((htmlElement) => {
      if (
        // @ts-ignore
        Array.from(components).some((v) => htmlElement.textContent.includes(v))
        || true) {
        (win as Window).document.head.appendChild(htmlElement.cloneNode(true));
      }
    });
    const bodyElement = (win as Window).document.body;
    setMountNode(bodyElement);
    setWindowRef(win);
  }

  const parentWindow = useWindowParentContext();

  const closeWindow = useCallback(() => {
    const { ipcRenderer } = global as any;
    if (ipcRenderer) {
      ipcRenderer.send("window-close", { id: id });
    }
  }, [id]);

  useEffect(() => {
    setTimeout(() => {
    if (windowRoot.current) {
      // @ts-ignore
      const {scrollHeight: height, scrollWidth: width} = windowRoot.current;
      // @ts-ignore
      const {ipcRenderer} = global as any;
      if (ipcRenderer) {
          ipcRenderer.send("window-size", {
            id: id,
            height: Math.ceil(height + 1),
            width: Math.ceil(width + 1),
          });

      }
    }
    },100);
  },[id]);

  useEffect(() => {
    const { ipcRenderer } = global as any;
    if (ipcRenderer) {
      setTimeout(() => {
        ipcRenderer.send("window-ready", {id: id});
      },120);
    }

    return () => {
      closeWindow();
    };
  }, [closeWindow, windowRef]);

  useIsomorphicLayoutEffect(() => {
    const { ipcRenderer } = global as any;
    if (ipcRenderer) {
      console.log(`${id} is being moved to ${style.left as number + parentWindow.left},${style.top as number + parentWindow.top}`);
      ipcRenderer.send("window-position", {
        id: id,
        parentWindowID: parentWindow.id,
        left: style.left,
        top: style.top,
      });
    }
  },[style]);

  return mountNode
    ? ReactDOM.createPortal(
        <ToolkitProvider>
            <WindowParentContext.Provider
              value={{
                top: style.top as number+ parentWindow.top,
                left: style.left as number + parentWindow.left,
                id: id
              }}
            >
              <div className="uitkWindow" ref={forkedRef}>
                <div className={className} {...rest}>
                  {children}
                </div>
              </div>
            </WindowParentContext.Provider>
        </ToolkitProvider>,
        mountNode
      )
    : null;
});

export const ElectronWindow = isElectron ? Window : ToolkitWindow;
