import { useEffect } from "react";
import { tabbable } from "tabbable";

interface UseSidePanelTabOrderProps {
  floating: HTMLElement | null;
  open: boolean;
  reference: HTMLElement | null;
}

const ORIGINAL_TABINDEX_ATTR = "data-salt-original-tabindex";

function isPlainTabKey(event: KeyboardEvent) {
  return (
    event.key === "Tab" && !event.altKey && !event.ctrlKey && !event.metaKey
  );
}

/**
 * Returns the panel's logical tab sequence. While the panel is open we
 * strip tabindex on descendants, so the sequence is discovered via the
 * data-salt-original-tabindex markers; falls back to a fresh tabbable()
 * scan before detachment runs.
 */
function getPanelTabbableElements(panel: HTMLElement): HTMLElement[] {
  const win = panel.ownerDocument.defaultView;
  const managed = Array.from(
    panel.querySelectorAll<HTMLElement>(`[${ORIGINAL_TABINDEX_ATTR}]`),
  ).filter((element) => {
    if (element.hasAttribute("disabled")) return false;
    if (element.getAttribute("aria-hidden") === "true") return false;
    // null offsetParent is also true for fixed/SVG; the display check
    // disambiguates.
    return !(
      element.offsetParent === null &&
      win?.getComputedStyle(element).display === "none"
    );
  });

  if (managed.length > 0) {
    return managed;
  }

  return tabbable(panel, { displayCheck: "none" }) as HTMLElement[];
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

/**
 * Returns the first tabbable element after `reference` in document order,
 * skipping anything inside `panel`.
 */
function getNextTabbableAfterReference(
  reference: HTMLElement,
  panel: HTMLElement,
) {
  const { body } = reference.ownerDocument;
  if (!body) return undefined;
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

/**
 * Detaches an element from the natural tab sequence, remembering its
 * original tabindex (or its absence) on a data attribute for restoration.
 */
function detachElement(element: HTMLElement) {
  if (!element.hasAttribute(ORIGINAL_TABINDEX_ATTR)) {
    const original = element.getAttribute("tabindex");
    element.setAttribute(ORIGINAL_TABINDEX_ATTR, original ?? "");
  }
  // Force re-apply: React may have rewritten the attribute on re-render.
  if (element.getAttribute("tabindex") !== "-1") {
    element.setAttribute("tabindex", "-1");
  }
}

function reattachElement(element: HTMLElement) {
  if (!element.hasAttribute(ORIGINAL_TABINDEX_ATTR)) return;
  const original = element.getAttribute(ORIGINAL_TABINDEX_ATTR);
  element.removeAttribute(ORIGINAL_TABINDEX_ATTR);
  if (original === null || original === "") {
    element.removeAttribute("tabindex");
  } else {
    element.setAttribute("tabindex", original);
  }
}

/**
 * Removes every tabbable descendant of `panel` from the natural tab order.
 * Returns a cleanup function that restores original tabindex values and
 * disconnects the observer used to track dynamically-added focusables.
 */
function detachPanelFromTabOrder(panel: HTMLElement) {
  const win = panel.ownerDocument.defaultView ?? window;

  const detach = () => {
    for (const element of tabbable(panel, { displayCheck: "none" })) {
      detachElement(element as HTMLElement);
    }
    // Re-assert tabindex="-1" on already-managed elements (React may
    // have written its prop value back).
    const managed = panel.querySelectorAll<HTMLElement>(
      `[${ORIGINAL_TABINDEX_ATTR}]`,
    );
    for (const element of Array.from(managed)) {
      if (element.getAttribute("tabindex") !== "-1") {
        element.setAttribute("tabindex", "-1");
      }
    }
  };

  detach();

  // Coalesce mutation bursts into one frame to avoid a feedback loop
  // between detach()'s tabindex writes and the observer's tabindex filter.
  let scheduled = 0;
  const scheduleDetach = () => {
    if (scheduled) return;
    scheduled = win.requestAnimationFrame(() => {
      scheduled = 0;
      detach();
    });
  };

  const observer = new MutationObserver(scheduleDetach);

  observer.observe(panel, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["tabindex", "disabled", "contenteditable", "hidden"],
  });

  return () => {
    if (scheduled) {
      win.cancelAnimationFrame(scheduled);
    }
    observer.disconnect();
    const managed = panel.querySelectorAll<HTMLElement>(
      `[${ORIGINAL_TABINDEX_ATTR}]`,
    );
    for (const element of Array.from(managed)) {
      reattachElement(element);
    }
  };
}

export function useSidePanelTabOrder(props: UseSidePanelTabOrderProps) {
  const { floating, open, reference } = props;

  useEffect(() => {
    if (!open || !reference || !floating) {
      return;
    }

    const { ownerDocument } = reference;

    // True when Tab on the trigger should walk into the panel (a "fresh
    // entry": focus arrived from before the trigger, or from nowhere).
    // Set false when focus arrives from inside / after the panel, so the
    // user can keep tabbing forward without getting trapped.
    let redirectTriggerTab = true;

    // Set true just before we programmatically focus the trigger, so the
    // focusin handler can preserve our explicit redirect intent instead
    // of overwriting it from the relatedTarget heuristic.
    let programmaticReferenceFocus = false;

    // Make panel content unreachable via natural Tab — only the trigger
    // flow below can enter.
    const releaseDetachment = detachPanelFromTabOrder(floating);

    const onReferenceFocus = (event: FocusEvent) => {
      if (programmaticReferenceFocus) {
        programmaticReferenceFocus = false;
        return;
      }

      const relatedTarget = event.relatedTarget as Node | null;

      // Focus arrived from inside / after the panel — disable redirect
      // so Tab moves forward naturally and doesn't trap the user.
      if (
        relatedTarget &&
        relatedTarget instanceof Node &&
        !(
          reference.compareDocumentPosition(relatedTarget) &
          Node.DOCUMENT_POSITION_PRECEDING
        )
      ) {
        redirectTriggerTab = false;
        return;
      }

      redirectTriggerTab = true;
    };

    const onReferenceKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !isPlainTabKey(event) || event.shiftKey) {
        return;
      }

      // Only redirect on a fresh entry; otherwise let the browser advance
      // to the next focusable element naturally.
      if (!redirectTriggerTab) {
        return;
      }

      event.preventDefault();
      redirectTriggerTab = false;
      focusFirstPanelElement(floating);
    };

    const onFloatingKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !isPlainTabKey(event)) {
        return;
      }

      const panelTabbableElements = getPanelTabbableElements(floating);
      const activeElement = floating.ownerDocument
        .activeElement as HTMLElement | null;
      const currentIndex = activeElement
        ? panelTabbableElements.indexOf(activeElement)
        : -1;

      if (event.shiftKey) {
        // At the start of the panel (or on the panel container itself):
        // exit backwards to the trigger and arm the redirect so the next
        // forward Tab walks back in.
        if (currentIndex <= 0) {
          event.preventDefault();
          redirectTriggerTab = true;
          programmaticReferenceFocus = true;
          reference.focus();
          return;
        }

        event.preventDefault();
        panelTabbableElements[currentIndex - 1].focus();
        return;
      }

      // At the end of the panel: exit forwards to the element after the
      // trigger. Also handles focus on the panel container itself when
      // the panel has no tabbable items.
      const atLast =
        currentIndex === panelTabbableElements.length - 1 ||
        (currentIndex === -1 && panelTabbableElements.length === 0);

      if (atLast) {
        event.preventDefault();
        const nextElement = getNextTabbableAfterReference(reference, floating);
        if (nextElement) {
          nextElement.focus();
        } else {
          // Nothing after the trigger — hand focus back to the trigger
          // but disable redirect so the next Tab moves naturally.
          redirectTriggerTab = false;
          programmaticReferenceFocus = true;
          reference.focus();
        }
        return;
      }

      // Focus on the panel container or an unmanaged ancestor — route
      // forward into the first managed element.
      if (currentIndex === -1) {
        event.preventDefault();
        panelTabbableElements[0].focus();
        return;
      }

      event.preventDefault();
      panelTabbableElements[currentIndex + 1].focus();
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
      focusLastPanelElement(floating);
    };

    reference.addEventListener("focus", onReferenceFocus);
    reference.addEventListener("keydown", onReferenceKeyDown);
    floating.addEventListener("keydown", onFloatingKeyDown);
    ownerDocument.addEventListener("keydown", onDocumentKeyDown);

    return () => {
      reference.removeEventListener("focus", onReferenceFocus);
      reference.removeEventListener("keydown", onReferenceKeyDown);
      floating.removeEventListener("keydown", onFloatingKeyDown);
      ownerDocument.removeEventListener("keydown", onDocumentKeyDown);
      releaseDetachment();
    };
  }, [floating, open, reference]);
}
