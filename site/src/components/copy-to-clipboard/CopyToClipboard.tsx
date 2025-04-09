import { Banner, BannerContent, Button, Code } from "@salt-ds/core";
import { CopyIcon } from "@salt-ds/icons";
import { type ReactNode, useState } from "react";
import { useRef } from "react";
import { Transition } from "react-transition-group";

import styles from "./CopyToClipboard.module.css";

const duration = 300; // --salt-duration-perceptible

const transitionStyles = {
  entering: { opacity: 1 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 },
  exited: { opacity: 0 },
  unmounted: { opacity: 0 },
};

const defaultStyle = {
  transition: `opacity ${duration}ms ease-in-out`,
  opacity: 1,
};

export const CopyToClipboard = ({
  value,
  children,
}: { value: string; children?: ReactNode }) => {
  const nodeRef = useRef(null);
  const [notifactionContent, setNotifactionContent] = useState<
    "none" | "error" | "success"
  >("none");

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setNotifactionContent("success");
      })
      .catch(() => {
        setNotifactionContent("error");
      });
    setTimeout(() => {
      setNotifactionContent("none");
    }, 1000);
  };

  return (
    <>
      {children ?? <Code>{value}</Code>}
      <Button
        onClick={() => handleCopyToClipboard(value)}
        aria-label="Copy to clipboard"
        appearance="transparent"
      >
        <CopyIcon aria-hidden />
      </Button>
      <Transition
        nodeRef={nodeRef}
        in={notifactionContent !== "none"}
        timeout={duration}
        mountOnEnter
        unmountOnExit
      >
        {(state) => {
          return (
            <Banner
              className={styles.fixedBanner}
              status={notifactionContent === "error" ? "error" : "success"}
              ref={nodeRef}
              style={{
                ...defaultStyle,
                ...transitionStyles[state],
              }}
            >
              <BannerContent>
                {notifactionContent === "error"
                  ? "Error copying"
                  : "Copied to clipboard"}
              </BannerContent>
            </Banner>
          );
        }}
      </Transition>
    </>
  );
};
