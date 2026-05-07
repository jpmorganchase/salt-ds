import { useCallback } from "react";
import { useSidePanelContext } from "./internal";

export interface SidePanelValue {
  /**
   * Whether the side panel is currently open.
   */
  openState: boolean;
  /**
   * Sets the open state of the panel.
   */
  setOpen: (open: boolean) => void;
  /**
   * Props getter for a single trigger element.
   * Merges `aria-expanded`, `aria-controls`, a `ref` callback (to register
   * the trigger for focus-return), and user-provided props.
   * Best for the common case where one button toggles one panel.
   *
   * For multi-trigger scenarios (e.g. table rows), use `setTriggerRef` and
   * manage ARIA attributes yourself instead.
   */
  getTriggerProps: (
    userProps?: Record<string, unknown>,
  ) => Record<string, unknown>;
  /**
   * Registers the element that should receive focus when the panel closes.
   * Use this in multi-trigger scenarios (e.g. table rows) where each trigger
   * needs explicit control over which element is the reference.
   */
  setTriggerRef: (element: HTMLElement | null) => void;
  /**
   * The panel's DOM id. Use this for `aria-controls` in multi-trigger
   * scenarios where you manage ARIA attributes yourself.
   */
  panelId: string | undefined;
}

export function useSidePanel(): SidePanelValue {
  const { openState, setOpen, setReference, panelId } = useSidePanelContext();

  const getTriggerProps = useCallback(
    (userProps?: Record<string, unknown>) => {
      const userOnClick = userProps?.onClick as
        | ((e: React.MouseEvent<HTMLElement>) => void)
        | undefined;

      return {
        "aria-expanded": openState,
        "aria-controls": openState ? panelId : undefined,
        ...userProps,
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          userOnClick?.(e);
        },
        ref: (node: HTMLElement | null) => {
          // Register this element as the trigger for focus return
          setReference(node);
          // Forward the consumer's ref if provided
          const userRef = userProps?.ref;
          if (typeof userRef === "function") {
            userRef(node);
          } else if (
            userRef &&
            typeof userRef === "object" &&
            "current" in userRef
          ) {
            (userRef as React.MutableRefObject<HTMLElement | null>).current =
              node;
          }
        },
      };
    },
    [openState, panelId, setReference],
  );

  return {
    openState,
    setOpen,
    getTriggerProps,
    setTriggerRef: setReference,
    panelId,
  };
}
