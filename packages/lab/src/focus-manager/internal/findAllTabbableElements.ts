import { ownerWindow } from "../../utils";

/**
 * Used to reduce the number of initial nodes that are checked to see if tabbable.
 *
 * Not possible to immediately check if a node is tabbable because the node may be a custom element
 * and therefore could potentially have a tabbable node within its shadow root.
 */
const anyKeyboardFocusedElementSelector =
  '*:not(style):not(script):not(noscript):not(link):not([tabindex="-1"])';

type HTMLElementOrNull = HTMLElement | null;

/**
 * Finds all the elements in the given root node that can be focused by a 'tab' keypress.
 * In addition, the trap-start and trap-end sentinel nodes are excluded, and all contained shadow roots are walked recursively
 * @param {Node} rootNode The containing node from which traversal begins.
 * @param {string} selector The CSS selector used to query for matching, tabbable elements.
 * @param {Node[]} elementsToIgnore Elements to ignore
 */
export function findAllTabbableElements(
  rootNode: HTMLElementOrNull | ShadowRoot,
  selector: string,
  elementsToIgnore: HTMLElementOrNull[] = []
): HTMLElement[] {
  if (!rootNode) {
    return [];
  }

  const nodes = Array.from<HTMLElement | HTMLSlotElement>(
    rootNode.querySelectorAll(anyKeyboardFocusedElementSelector)
  ).slice();

  return nodes.reduce((foundNodes, node) => {
    if (elementsToIgnore.indexOf(node) !== -1) {
      return foundNodes;
    }

    const win = ownerWindow(node);
    // Skip hidden nodes. assignedElements needs to be checked here to make sure we don't ignore slots
    if (
      (node.getBoundingClientRect().width === 0 ||
        win.getComputedStyle(node).visibility !== "visible") &&
      node instanceof HTMLSlotElement &&
      typeof node.assignedElements !== "function"
    ) {
      return foundNodes;
    }

    // If node is a slot return assigned elements.
    if (
      node instanceof HTMLSlotElement &&
      typeof node.assignedElements === "function"
    ) {
      return foundNodes.concat(
        node.assignedElements().filter((n) => !n.shadowRoot) as HTMLElement[]
      );
    }

    if (!node.shadowRoot && node.matches(selector)) {
      // If this element is inside a shadowRoot then the host not the element itself is needed.
      const rootNode = node.parentNode?.getRootNode();
      return foundNodes.concat(
        rootNode instanceof ShadowRoot ? (rootNode.host as HTMLElement) : node
      );
    }
    if (node.shadowRoot) {
      return foundNodes.concat(
        findAllTabbableElements(node.shadowRoot, selector, elementsToIgnore)
      );
    }

    return foundNodes;
  }, [] as HTMLElement[]);
}
