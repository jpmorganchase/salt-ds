import { useEventCallback } from "@salt-ds/core";
import type {
  ComponentPropsWithoutRef,
  MouseEvent,
  MutableRefObject,
  RefCallback,
} from "react";
import { useSidePanelContext } from "./internal";

export interface SidePanelTriggerExtraProps {
  /**
   * Optional ref to forward alongside the focus-return registration.
   */
  ref?:
    | RefCallback<HTMLElement | null>
    | MutableRefObject<HTMLElement | null>
    | null;
  /**
   * Click handler. Runs before the built-in toggle so consumers can
   * preventDefault to skip the toggle.
   */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export type SidePanelTriggerPropsResult = ComponentPropsWithoutRef<"button"> & {
  "aria-expanded": boolean;
  "aria-controls": string | undefined;
  ref: RefCallback<HTMLElement | null>;
};

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
   * Props getter for a trigger element outside of `SidePanelTrigger`.
   * Returns `aria-expanded`, `aria-controls`, a `ref` (for focus-return),
   * and an `onClick` that toggles the panel.
   *
   * Spread the result onto a Button to get full trigger behavior:
   * ```tsx
   * <Button {...getTriggerProps()}>Toggle panel</Button>
   * ```
   *
   * You can pass additional props which are merged in. If you provide your
   * own `onClick`, it runs before the built-in toggle. If you provide your
   * own `ref`, it is forwarded alongside the internal focus-return ref.
   *
   * For multi-trigger scenarios (e.g. table rows), use `setTriggerRef` and
   * manage ARIA attributes yourself instead.
   */
  getTriggerProps: (
    userProps?: SidePanelTriggerExtraProps,
  ) => SidePanelTriggerPropsResult;
  /**
   * Registers the element that should receive focus when the panel closes.
   * Use this in multi-trigger scenarios (e.g. table rows) where each trigger
   * needs explicit control over which element is the reference. Pass `null`
   * to clear the previously-registered trigger.
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

  // useEventCallback gives a stable identity so consumers can memoise
  // around getTriggerProps without it churning on open/close.
  const getTriggerProps = useEventCallback(
    (userProps?: SidePanelTriggerExtraProps): SidePanelTriggerPropsResult => {
      const userOnClick = userProps?.onClick;
      const userRef = userProps?.ref;

      return {
        "aria-expanded": openState,
        "aria-controls": openState ? panelId : undefined,
        ...userProps,
        onClick: (event: MouseEvent<HTMLButtonElement>) => {
          userOnClick?.(event);
          setOpen(!openState);
        },
        ref: (node: HTMLElement | null) => {
          setReference(node);
          if (typeof userRef === "function") {
            userRef(node);
          } else if (
            userRef &&
            typeof userRef === "object" &&
            "current" in userRef
          ) {
            userRef.current = node;
          }
        },
      };
    },
  );

  return {
    openState,
    setOpen,
    getTriggerProps,
    setTriggerRef: setReference,
    panelId,
  };
}
