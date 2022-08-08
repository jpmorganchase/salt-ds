import {
  makePrefixer,
  ownerDocument,
  useForkRef,
  useId,
} from "@jpmorganchase/uitk-core";
import { hideOthers } from "aria-hidden";
import classnames from "classnames";
import noScroll from "no-scroll";
import {
  forwardRef,
  HTMLAttributes,
  MouseEventHandler,
  RefObject,
  SyntheticEvent,
  useEffect,
  useRef,
} from "react";
import { FocusManager, FocusManagerProps } from "../focus-manager";
import { preventFocusOthers } from "./internal/PreventFocus";
import { ScrimContext } from "./ScrimContext";

import "./Scrim.css";

const scrims = new Set();

const defaultParent = typeof document !== "undefined" ? document.body : null;

const noop = () => {};

const withBaseName = makePrefixer("uitkScrim");

function preventSelection(parent = defaultParent): () => void {
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
   * Prop to enable container use case.
   * It also sets the different z-index for usage in containers.
   * If present it will also override FocusTrap for Scrim.
   * Default value of containerFix is false.
   */
  containerFix?: boolean;
  /**
   * If `true`, the trap focus will not automatically shift focus to itself when it opens, and
   * replace it to the last focused element when it closes.
   */
  disableAutoFocus?: boolean;
  /**
   * If `true`, the trap focus will not prevent focus from leaving the trap focus while open.
   */
  disableEnforceFocus?: boolean;
  /**
   * If `true`, the trap focus will not restore focus to previously focused element once
   * trap focus is hidden.
   */
  disableReturnFocus?: boolean;
  /**
   * By default, an error will be thrown if the focus trap contains no elements in its tab order.
   * With this option you can specify a fallback element to programmatically receive focus if no other tabbable elements are found.
   * For example, you may want a popover's <div> to receive focus if the popover's content includes no tabbable elements.
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
   * Parent react ref which needs to be passed in container use case.
   */
  parentRef?: RefObject<HTMLElement>;
  /**
   * Prop to return focus to active element of when Scrim is closed.
   * The default value is true.
   */
  returnFocus?: FocusManagerProps["returnFocus"];
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
  props,
  ref
) {
  const {
    autoFocusRef,
    closeWithEscape = false,
    className,
    children,
    containerFix = false,
    disableAutoFocus,
    disableEnforceFocus,
    disableReturnFocus,
    fallbackFocusRef,
    onBackDropClick,
    onClose,
    open,
    parentRef,
    returnFocus = true,
    tabEnabledSelectors = defaultSelector,
    zIndex,
    ...rest
  } = props;

  const scrimRef = useRef<HTMLDivElement>(null);
  const setWrapperRef = useForkRef(ref, scrimRef);
  const undoAria = useRef(noop);
  const undoSelection = useRef(noop);
  const undoTabIndex = useRef(noop);
  const scrimId = useId();

  useEffect(() => {
    if (open && !containerFix) {
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
  }, [containerFix, open, scrimId]);

  useEffect(() => {
    if (open) {
      const parent = parentRef?.current as HTMLElement;

      if (scrimRef.current) {
        undoAria.current = hideOthers(scrimRef.current, parent);
      }
    }

    return () => {
      undoAria.current?.();
    };
  }, [containerFix, open, parentRef]);

  useEffect(() => {
    if (open) {
      const parent = parentRef?.current;

      if (containerFix && parent) {
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
  }, [containerFix, open, parentRef, tabEnabledSelectors]);

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

    return undefined;
  }, [closeWithEscape, onClose, open]);

  const handleClick: MouseEventHandler<HTMLDivElement> = (event) => {
    onBackDropClick?.(event);
  };

  if (!open) {
    return null;
  }

  return (
    <div
      aria-modal={!containerFix}
      className={classnames(className, withBaseName(), {
        [withBaseName(`containerFix`)]: containerFix,
      })}
      data-testid="scrim"
      onClick={handleClick}
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
        disableEnforceFocus={disableEnforceFocus || containerFix}
        disableReturnFocus={disableReturnFocus}
        returnFocus={returnFocus}
        tabEnabledSelectors={tabEnabledSelectors}
      >
        <ScrimContext.Provider value={onClose}>
          {children}
        </ScrimContext.Provider>
      </FocusManager>
    </div>
  );
});
