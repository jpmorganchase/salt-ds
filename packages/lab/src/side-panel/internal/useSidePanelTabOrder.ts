import { useEffect, useRef } from "react";
import { tabbable } from "tabbable";

interface UseSidePanelTabOrderProps {
  floating: HTMLElement | null;
  open: boolean;
  reference: HTMLElement | null;
}

function isPlainTabKey(event: KeyboardEvent) {
  return (
    event.key === "Tab" && !event.altKey && !event.ctrlKey && !event.metaKey
  );
}

function getPanelTabbableElements(panel: HTMLElement) {
  return tabbable(panel);
}

function focusFirstPanelElement(panel: HTMLElement) {
  const [firstTabbableElement] = getPanelTabbableElements(panel);
  (firstTabbableElement ?? panel).focus();
}

function focusLastPanelElement(panel: HTMLElement) {
  const tabbableElements = getPanelTabbableElements(panel);
  (tabbableElements[tabbableElements.length - 1] ?? panel).focus();
}

function containsTarget(container: Element, target: EventTarget | null) {
  const targetWindow = container.ownerDocument.defaultView;

  return Boolean(
    targetWindow?.Node &&
      target instanceof targetWindow.Node &&
      container.contains(target),
  );
}

function getNextTabbableAfterReference(
  reference: HTMLElement,
  panel: HTMLElement,
) {
  const { body } = reference.ownerDocument;
  const tabbableElements = tabbable(body).filter(
    (element) => !panel.contains(element),
  );
  const referenceIndex = tabbableElements.findIndex(
    (element) => element === reference || reference.contains(element),
  );

  if (referenceIndex === -1) {
    return undefined;
  }

  return tabbableElements[referenceIndex + 1];
}

export function useSidePanelTabOrder(props: UseSidePanelTabOrderProps) {
  const { floating, open, reference } = props;
  const followsReferenceOrder = useRef(false);

  useEffect(() => {
    if (!open || !reference || !floating) {
      followsReferenceOrder.current = false;
      return;
    }

    const { ownerDocument } = reference;

    const onReferenceKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !isPlainTabKey(event) || event.shiftKey) {
        return;
      }

      event.preventDefault();
      followsReferenceOrder.current = true;
      focusFirstPanelElement(floating);
    };

    const onFloatingKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !isPlainTabKey(event)) {
        return;
      }

      const panelTabbableElements = getPanelTabbableElements(floating);
      const activeElement = floating.ownerDocument.activeElement;

      if (event.shiftKey) {
        const firstPanelElement = panelTabbableElements[0] ?? floating;

        if (
          activeElement === firstPanelElement &&
          followsReferenceOrder.current
        ) {
          event.preventDefault();
          followsReferenceOrder.current = false;
          reference.focus();
        }
        return;
      }

      const lastPanelElement =
        panelTabbableElements[panelTabbableElements.length - 1] ?? floating;

      if (activeElement === lastPanelElement && followsReferenceOrder.current) {
        const nextElement = getNextTabbableAfterReference(reference, floating);

        if (nextElement) {
          event.preventDefault();
          followsReferenceOrder.current = false;
          nextElement.focus();
        }
      }
    };

    const onDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !isPlainTabKey(event) || !event.shiftKey) {
        return;
      }

      const nextElement = getNextTabbableAfterReference(reference, floating);
      if (!nextElement || !containsTarget(nextElement, event.target)) {
        return;
      }

      event.preventDefault();
      followsReferenceOrder.current = true;
      focusLastPanelElement(floating);
    };

    const onFloatingFocusIn = (event: FocusEvent) => {
      if (containsTarget(reference, event.relatedTarget)) {
        followsReferenceOrder.current = true;
        return;
      }

      const nextElement = getNextTabbableAfterReference(reference, floating);
      if (nextElement && containsTarget(nextElement, event.relatedTarget)) {
        followsReferenceOrder.current = true;
        return;
      }

      if (!containsTarget(floating, event.relatedTarget)) {
        followsReferenceOrder.current = false;
      }
    };

    reference.addEventListener("keydown", onReferenceKeyDown);
    floating.addEventListener("keydown", onFloatingKeyDown);
    floating.addEventListener("focusin", onFloatingFocusIn);
    ownerDocument.addEventListener("keydown", onDocumentKeyDown);

    return () => {
      reference.removeEventListener("keydown", onReferenceKeyDown);
      floating.removeEventListener("keydown", onFloatingKeyDown);
      floating.removeEventListener("focusin", onFloatingFocusIn);
      ownerDocument.removeEventListener("keydown", onDocumentKeyDown);
    };
  }, [floating, open, reference]);
}
