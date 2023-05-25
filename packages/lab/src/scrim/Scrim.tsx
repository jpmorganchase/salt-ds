import { hideOthers } from "aria-hidden";
import { clsx } from "clsx";
import noScroll from "no-scroll";
import {
  forwardRef,
  HTMLAttributes,
  RefObject,
  SyntheticEvent,
  useEffect,
  useRef,
} from "react";
import { makePrefixer, ownerDocument, useForkRef, useId } from "@salt-ds/core";
import { FocusManager, FocusManagerProps } from "../focus-manager";
import { preventFocusOthers } from "./internal/PreventFocus";
import { ScrimContext } from "./ScrimContext";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import scrimCss from "./Scrim.css";

const scrims = new Set();

const getDefaultParent = () =>
  typeof document !== "undefined" ? document.body : null;

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const withBaseName = makePrefixer("saltScrim");

function preventSelection(parent = getDefaultParent()): () => void {
  if (parent) {
    const previous = parent.style.userSelect;
    parent.style.userSelect = "none";

    return () => {
      parent.style.userSelect = previous;
    };
  }
  return noop;
}

const defaultSelector = `
[tabindex="0"],
a:not([tabindex="-1"]),
area:not([tabindex="-1"]),
details:not([tabindex="-1"]),
iframe:not([tabindex="-1"]),
select:not([tabindex="-1"]),
textarea:not([tabindex="-1"]),
button:not([tabindex="-1"]),
input:not([tabindex="-1"])
`;

export interface ScrimProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Ref of the element that automatically receives focus when the Scrim is opened.
   */
  autoFocusRef?: FocusManagerProps["autoFocusRef"];
  /**
   * Prop to enable escape key to close scrim.
   * The default value of this props is false
   */
  closeWithEscape?: boolean;
  /**
   * If `true`, the trap focus will not automatically shift focus to itself when it opens, and
   * replace it to the last focused element when it closes.
   */
  disableAutoFocus?: boolean;
  /**
   * If `true`, the trap focus will not prevent focus from leaving the trap focus while open.
   */
  disableFocusTrap?: boolean;
  /**
   * If `true`, the trap focus will not restore focus to previously focused element once
   * trap focus is hidden.
   */
  disableReturnFocus?: boolean;
  /**
   * By default, an error will be thrown if the focus trap contains no elements in its tab order.
   * With this option you can specify a fallback element to programmatically receive focus if no other tabbable elements are found.
   * For example, you may want a popover's `<div>` to receive focus if the popover's content includes no tabbable elements.
   */
  fallbackFocusRef?: FocusManagerProps["fallbackFocusRef"];
  /**
   * The handler for backdrop click on Scrim.
   */
  onBackDropClick?: (e: SyntheticEvent) => void;
  /**
   * The handler for onClose of Scrim.
   */
  onClose?: () => void;
  /**
   * To maintain open and close of the scrim.
   */
  open?: boolean;
  /**
   * Set to true to enable the container use case. If true the Scrim will be bound to a container ref you pass via the `parentRef` prop.
   * Default value is false, and the default behavior is for Scrim to be bound to the document viewport.
   */
  enableContainerMode?: boolean;
  /**
   * Prop necessary to enable container use case. Pass the parent element ref that you want Scrim to be bound to.
   * Default value is undefined, and the default behavior is for Scrim to be bound to the document viewport.
   */
  containerRef?: RefObject<HTMLElement>;
  /**
   * Options object to pass to the `focus()` method that is called on the previously focused element when Scrim is closed.
   */
  returnFocusOptions?: FocusManagerProps["returnFocusOptions"];
  /**
   * comma separated string of query selectors which may need to be overridden for edge cases.
   */
  tabEnabledSelectors?: string;
  /**
   * Prop to pass z-index for Scrim.
   */
  zIndex?: number;
}

export const Scrim = forwardRef<HTMLDivElement, ScrimProps>(function Scrim(
  {
    autoFocusRef,
    closeWithEscape = false,
    className,
    children,
    disableAutoFocus,
    disableFocusTrap,
    disableReturnFocus,
    fallbackFocusRef,
    onBackDropClick,
    onClose,
    open,
    containerRef,
    enableContainerMode = false,
    returnFocusOptions,
    tabEnabledSelectors = defaultSelector,
    zIndex,
    ...rest
  },
  ref
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-scrim",
    css: scrimCss,
    window: targetWindow,
  });

  const scrimRef = useRef<HTMLDivElement>(null);
  const setWrapperRef = useForkRef(ref, scrimRef);
  const undoAria = useRef(noop);
  const undoSelection = useRef(noop);
  const undoTabIndex = useRef(noop);
  const scrimId = useId();

  useEffect(() => {
    if (open && !containerRef?.current) {
      scrims.add(scrimId);
      noScroll.on();
    }

    return () => {
      if (open) {
        scrims.delete(scrimId);
        if (scrims.size === 0) {
          noScroll.off();
        }
      }
    };
  }, [open, containerRef, scrimId]);

  useEffect(() => {
    if (open) {
      const parent = containerRef?.current || undefined;

      if (scrimRef.current) {
        undoAria.current = hideOthers(scrimRef.current, parent);
      }
    }

    return () => {
      undoAria.current?.();
    };
  }, [open, containerRef]);

  useEffect(() => {
    if (open) {
      const parent = containerRef?.current;

      if (parent) {
        undoSelection.current = preventSelection(parent);
        undoTabIndex.current = preventFocusOthers(
          scrimRef.current,
          tabEnabledSelectors,
          parent
        );
      }
    }

    return () => {
      undoSelection.current?.();
      undoTabIndex.current?.();
    };
  }, [open, containerRef, tabEnabledSelectors]);

  useEffect(() => {
    if (closeWithEscape && open && scrimRef.current) {
      const escapeHandler = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onClose?.();
        }
      };

      const doc = ownerDocument(scrimRef.current);
      doc.addEventListener("keydown", escapeHandler);

      return () => {
        doc.removeEventListener("keydown", escapeHandler);
      };
    }
  }, [closeWithEscape, onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-modal={!enableContainerMode}
      className={clsx(className, withBaseName(), {
        [withBaseName("containerFix")]: enableContainerMode,
      })}
      data-testid="scrim"
      onClick={onBackDropClick}
      ref={setWrapperRef}
      role="dialog"
      style={{
        zIndex,
      }}
      {...rest}
    >
      <FocusManager
        active={open}
        autoFocusRef={autoFocusRef}
        disableAutoFocus={disableAutoFocus}
        disableFocusTrap={disableFocusTrap || !!enableContainerMode}
        disableReturnFocus={disableReturnFocus}
        returnFocusOptions={returnFocusOptions}
        tabEnabledSelectors={tabEnabledSelectors}
      >
        <ScrimContext.Provider value={onClose}>
          {children}
        </ScrimContext.Provider>
      </FocusManager>
    </div>
  );
});
