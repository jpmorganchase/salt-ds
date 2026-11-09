import { Button, FlexLayout, StackLayout, Text } from "@salt-ds/core";
import {
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

// Every approach uses the same info and error content, so stories can be
// compared across approaches. Info is paired with polite and error with
// assertive live regions. The status itself is not read out: it only changes
// the colour, and the icon is aria-hidden.
export const POC_INFO = {
  status: "info",
  message:
    "Scheduled maintenance is planned for Saturday from 08:00 to 10:00 UTC. Some services may be unavailable.",
} as const;

export const POC_ERROR = {
  status: "error",
  message:
    "Some services are unavailable. We're working to restore them as quickly as possible.",
} as const;

// Side-by-side and stacked modes render the story twice, each copy with its
// own AriaAnnouncerProvider, which would double every announcement.
export const pocGlobals = { mode: "light" };

export interface PocToggle {
  open: boolean;
  show: () => void;
  hide: () => void;
  showLater: () => void;
  /** Hides the system status and returns focus to the show button. */
  dismiss: () => void;
  showButtonRef: RefObject<HTMLButtonElement>;
}

export function usePocToggle(onShow?: () => void): PocToggle {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const timeoutRef = useRef<number | undefined>(undefined);
  const showButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const clearPending = () => {
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = undefined;
  };

  const show = () => {
    clearPending();
    if (openRef.current) return;
    openRef.current = true;
    setOpen(true);
    onShow?.();
  };

  const hide = () => {
    clearPending();
    openRef.current = false;
    setOpen(false);
  };

  return {
    open,
    show,
    hide,
    showLater: () => {
      clearPending();
      timeoutRef.current = window.setTimeout(show, 3000);
    },
    dismiss: () => {
      hide();
      showButtonRef.current?.focus();
    },
    showButtonRef,
  };
}

export interface PocLayoutProps {
  /** What the story does. */
  description: string;
  /** What to pay attention to when testing this story. */
  listenFor?: string;
  toggle: PocToggle;
  children: ReactNode;
}

export const PocLayout = ({
  description,
  listenFor,
  toggle,
  children,
}: PocLayoutProps) => (
  <StackLayout gap={2} style={{ width: 600 }}>
    <StackLayout gap={1}>
      <Text>{description}</Text>
      {listenFor && <Text>{listenFor}</Text>}
      <Text color="secondary">
        How to test: start a screen reader, activate "Show system status" and
        listen. Activate "Hide system status", then activate "Show in 3 seconds"
        and move focus elsewhere on the page while you wait, as you would when
        an outage happens without you triggering it.
      </Text>
    </StackLayout>
    <FlexLayout gap={1}>
      <Button ref={toggle.showButtonRef} onClick={toggle.show}>
        Show system status
      </Button>
      <Button variant="secondary" onClick={toggle.hide}>
        Hide system status
      </Button>
      <Button variant="secondary" onClick={toggle.showLater}>
        Show in 3 seconds
      </Button>
    </FlexLayout>
    {children}
  </StackLayout>
);
