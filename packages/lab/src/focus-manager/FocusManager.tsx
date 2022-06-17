import {
  ownerDocument,
  useIsomorphicLayoutEffect,
} from "@jpmorganchase/uitk-core";
import {
  FocusEvent,
  ReactNode,
  RefObject,
  useCallback,
  useRef,
  useState,
} from "react";
import { findAllTabbableElements } from "./internal/findAllTabbableElements";
import { useReturnFocus, UseReturnFocusProps } from "./internal/useReturnFocus";

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

export interface FocusManagerProps {
  active?: boolean;
  autoFocusRef?: RefObject<HTMLElement>;
  children?: ReactNode;
  className?: string;
  disableAutoFocus?: boolean;
  disableEnforceFocus?: boolean;
  disableReturnFocus?: boolean;
  fallbackFocusRef?: RefObject<HTMLElement>;
  tabEnabledSelectors?: string;
  returnFocus?: UseReturnFocusProps["focusOptions"];
}

function tryFocus(node?: HTMLElement) {
  if (!node) return;

  const initialTabIndex = node.getAttribute("tabindex");
  node.setAttribute("tabindex", "-1");

  const removeTabIndex = () => {
    if (initialTabIndex === null) {
      node.removeAttribute("tabindex");
    } else {
      node.setAttribute("tabindex", initialTabIndex);
    }

    node.removeEventListener("blur", removeTabIndex);
  };

  node.addEventListener("blur", removeTabIndex);

  node.focus();
}

export function FocusManager(props: FocusManagerProps): JSX.Element {
  const {
    active,
    autoFocusRef,
    children,
    className,
    disableAutoFocus,
    disableEnforceFocus,
    disableReturnFocus,
    fallbackFocusRef,
    tabEnabledSelectors = defaultSelector,
    returnFocus,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const trapStartRef = useRef<HTMLDivElement>(null);
  const trapEndRef = useRef<HTMLDivElement>(null);
  const staticElementRef = useRef<HTMLDivElement>(null);
  const [hasFocus, setHasFocus] = useState(false);

  useReturnFocus({
    focusOptions: returnFocus,
    disabled: disableReturnFocus || disableAutoFocus,
    active,
    document: ownerDocument(containerRef.current),
  });

  /**
   * Given a list of elements and an index, the corresponding element is returned, if exists.
   * Alternatively, for a shadow root, the first tabbable element is returned.
   * @param {Node[]} tabbableElements A list of elements from which to select.
   * @param {number} index The list index.
   */
  const resolveElementAtIndex = useCallback(
    (tabbableElements: HTMLElement[], index: number) => {
      if (tabbableElements.length >= 1) {
        const element = tabbableElements[index];

        if (element?.shadowRoot) {
          return element.shadowRoot.querySelector<HTMLElement>(
            tabEnabledSelectors
          );
        }

        return element;
      }
    },
    [tabEnabledSelectors]
  );

  /**
   * Return the first tabbable element within the content area.
   */
  const getFirstElement = useCallback(() => {
    const tabbableElements = findAllTabbableElements(
      containerRef.current,
      tabEnabledSelectors,
      [trapEndRef.current, trapStartRef.current]
    );
    return resolveElementAtIndex(tabbableElements, 0);
  }, [resolveElementAtIndex, tabEnabledSelectors]);

  /**
   * Return the last tabbable element within the content area.
   */
  const getLastElement = () => {
    const tabbableElements = findAllTabbableElements(
      containerRef.current,
      tabEnabledSelectors,
      [trapEndRef.current, trapStartRef.current]
    );
    return resolveElementAtIndex(tabbableElements, tabbableElements.length - 1);
  };

  /**
   * When the trap-start sentinel node gains focus, pass focus to either
   * the first or last tabbable element, depending on the direction of travel
   * (i.e. Tab or Shift+Tab)
   * @param {React.FocusEvent} event The synthetic focus event.
   */
  const handleTrapStartFocus = (event: FocusEvent<HTMLDivElement>) => {
    const isEnteringFocusTrap =
      !hasFocus &&
      ownerDocument(containerRef.current).activeElement ===
        trapStartRef.current;

    const nextElement = isEnteringFocusTrap
      ? getFirstElement()
      : getLastElement();

    if (nextElement) {
      nextElement.focus();
    }

    event.preventDefault();
  };

  /**
   * When the trap-end sentinel node gains focus, pass focus to either
   * the first tabbable element.
   * @param {React.FocusEvent} event The synthetic focus event.
   */
  const handleTrapEndFocus = (event: FocusEvent<HTMLDivElement>) => {
    const nextElement = getFirstElement();

    if (nextElement) {
      nextElement.focus();
    }

    event.preventDefault();
  };

  useIsomorphicLayoutEffect(() => {
    if (active && !disableAutoFocus) {
      let nodeToFocus;

      if (autoFocusRef?.current) {
        nodeToFocus = autoFocusRef.current;
      } else {
        nodeToFocus = getFirstElement() || fallbackFocusRef?.current;
      }

      if (!nodeToFocus) {
        // This will always be the case when we're applying the shim in a desktop window. Need to consider how to fix.
        console.error(
          "Your focus trap needs to contain at least once focused node."
        );
      } else if (nodeToFocus !== ownerDocument(nodeToFocus).activeElement) {
        tryFocus(nodeToFocus);
      }
    }
  }, [active, disableAutoFocus, getFirstElement, autoFocusRef]);

  const enforceFocus = active && !disableEnforceFocus;

  return (
    <div
      className={className}
      onFocus={() => setHasFocus(true)}
      ref={containerRef}
    >
      <div
        aria-hidden="true"
        onFocus={handleTrapStartFocus}
        ref={trapStartRef}
        tabIndex={enforceFocus ? 0 : -1}
      />
      <div ref={staticElementRef} tabIndex={-1} />
      {children}
      <div
        aria-hidden="true"
        onFocus={handleTrapEndFocus}
        ref={trapEndRef}
        tabIndex={enforceFocus ? 0 : -1}
      />
    </div>
  );
}
