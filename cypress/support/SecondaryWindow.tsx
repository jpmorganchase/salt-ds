import { WindowProvider } from "@salt-ds/window";
import { type ReactNode, useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface SecondaryWindowProps {
  children: ReactNode;
  prepareWindow?: (targetWindow: Window) => void;
}

export function SecondaryWindow({
  children,
  prepareWindow,
}: SecondaryWindowProps) {
  const [targetWindow, setTargetWindow] = useState<Window | null>(null);
  const preparedWindowRef = useRef<Window | null>(null);
  const handleFrameRef = useCallback(
    (frame: HTMLIFrameElement | null) => {
      const nextWindow = frame?.contentWindow ?? null;
      if (nextWindow && preparedWindowRef.current !== nextWindow) {
        prepareWindow?.(nextWindow);
        preparedWindowRef.current = nextWindow;
      }
      setTargetWindow(nextWindow);
    },
    [prepareWindow],
  );

  return (
    <>
      <iframe ref={handleFrameRef} title="Secondary window" />
      {targetWindow && (
        <WindowProvider window={targetWindow}>
          {createPortal(children, targetWindow.document.body)}
        </WindowProvider>
      )}
    </>
  );
}
