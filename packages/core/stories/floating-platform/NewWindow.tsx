import {
  ComponentPropsWithoutRef,
  forwardRef,
  useState,
  createContext,
  useContext,
  ForwardedRef,
  useMemo,
} from "react";
import { WindowProvider, useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { SaltProvider, useForkRef } from "@salt-ds/core";
import { createPortal } from "react-dom";

import themeCss from "@salt-ds/theme/index.css";
import font300Css from "@fontsource/open-sans/300.css";
import font300iCss from "@fontsource/open-sans/300-italic.css";
import font400Css from "@fontsource/open-sans/400.css";
import font400iCss from "@fontsource/open-sans/400-italic.css";
import font500Css from "@fontsource/open-sans/500.css";
import font500iCss from "@fontsource/open-sans/500-italic.css";
import font600Css from "@fontsource/open-sans/600.css";
import font600iCss from "@fontsource/open-sans/600-italic.css";
import font700Css from "@fontsource/open-sans/700.css";
import font700iCss from "@fontsource/open-sans/700-italic.css";
import font800Css from "@fontsource/open-sans/800.css";
import font800iCss from "@fontsource/open-sans/800-italic.css";

const globalCss = `
    html,body {
        margin: 0;
        overflow: hidden;
    }

    html,body * {
        box-shadow: none;
    }
`;

type Props = ComponentPropsWithoutRef<"iframe"> & {
  title?: string;
};

const StyleInjection = () => {
  const targetWindow = useWindow();

  useComponentCssInjection({ css: themeCss, window: targetWindow });
  useComponentCssInjection({ css: font300Css, window: targetWindow });
  useComponentCssInjection({ css: font300iCss, window: targetWindow });
  useComponentCssInjection({ css: font400Css, window: targetWindow });
  useComponentCssInjection({ css: font400iCss, window: targetWindow });
  useComponentCssInjection({ css: font500Css, window: targetWindow });
  useComponentCssInjection({ css: font500iCss, window: targetWindow });
  useComponentCssInjection({ css: font600Css, window: targetWindow });
  useComponentCssInjection({ css: font600iCss, window: targetWindow });
  useComponentCssInjection({ css: font700Css, window: targetWindow });
  useComponentCssInjection({ css: font700iCss, window: targetWindow });
  useComponentCssInjection({ css: font800Css, window: targetWindow });
  useComponentCssInjection({ css: font800iCss, window: targetWindow });
  useComponentCssInjection({ css: globalCss, window: targetWindow });

  return null;
};

export const FloatingComponentWindow = forwardRef(
  (
    { children, title, style, ...rest }: Props,
    ref: ForwardedRef<HTMLIFrameElement>
  ) => {
    const [contentRef, setContentRef] = useState<HTMLIFrameElement | null>(
      null
    );

    const mountNode = contentRef?.contentWindow?.document?.body;

    const wrappedChildren = useMemo(
      () => <SaltProvider>{children}</SaltProvider>,
      [children]
    );

    return (
      <iframe
        {...rest}
        style={style}
        title={title}
        ref={setContentRef as ForwardedRef<HTMLIFrameElement>}
      >
        {mountNode && (
          <WindowProvider window={contentRef?.contentWindow}>
            <StyleInjection />
            {createPortal(wrappedChildren, mountNode)}
          </WindowProvider>
        )}
      </iframe>
    );
  }
);

export const NewWindow = forwardRef(
  (
    { children, title, style, ...rest }: Props,
    ref: ForwardedRef<HTMLIFrameElement>
  ) => {
    const [contentRef, setContentRef] = useState<HTMLIFrameElement | null>(
      null
    );

    const mountNode = contentRef?.contentWindow?.document?.body;

    const iframeRef = useForkRef(ref, setContentRef);

    const wrappedChildren = useMemo(
      () => <SaltProvider>{children}</SaltProvider>,
      [children]
    );

    return (
      <iframe
        {...rest}
        style={style}
        title={title}
        ref={iframeRef as ForwardedRef<HTMLIFrameElement>}
      >
        {mountNode && (
          <WindowProvider window={contentRef?.contentWindow}>
            <StyleInjection />
            {createPortal(wrappedChildren, mountNode)}
          </WindowProvider>
        )}
      </iframe>
    );
  }
);
