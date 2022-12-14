import { findAllTabbableElements } from "../../focus-manager/internal/findAllTabbableElements";

const tabIndexMap = new WeakMap<HTMLElement, string | null>();

export function preventFocusOthers(
  originalTarget: HTMLElement | null,
  tabbableSelector: string,
  parentNode: HTMLElement
): () => void {
  const elementsToHide: HTMLElement[] = findAllTabbableElements(
    parentNode,
    tabbableSelector,
    [
      originalTarget,
      ...findAllTabbableElements(originalTarget, tabbableSelector),
    ]
  );

  elementsToHide.forEach((elem) => {
    if (!tabIndexMap.has(elem)) {
      tabIndexMap.set(elem, elem.getAttribute("tabIndex"));
      elem.setAttribute("tabIndex", "-1");
    }
  });

  return () => {
    elementsToHide.forEach((element) => {
      if (tabIndexMap.has(element)) {
        const tabIndex = tabIndexMap.get(element);
        if (tabIndex) {
          element.setAttribute("tabIndex", tabIndex);
        } else {
          element.removeAttribute("tabIndex");
        }

        tabIndexMap.delete(element);
      }
    });
  };
}
