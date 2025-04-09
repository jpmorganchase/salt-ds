import { Button, Code, Toast, ToastContent } from "@salt-ds/core";
import { CopyIcon } from "@salt-ds/icons";
import { type ReactNode, useRef, useState } from "react";
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
            <Toast
              className={styles.fixedNotification}
              status={notifactionContent === "error" ? "error" : "success"}
              ref={nodeRef}
              style={{
                ...defaultStyle,
                ...transitionStyles[state],
              }}
            >
              <ToastContent>
                {notifactionContent === "error"
                  ? "Error copying"
                  : "Copied to clipboard"}
              </ToastContent>
            </Toast>
          );
        }}
      </Transition>
    </>
  );
};
