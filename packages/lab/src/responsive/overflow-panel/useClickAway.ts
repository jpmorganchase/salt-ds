import { useEffect } from "react";

import useEventCallback from "./useEventCallback";
import useMountedRef from "../../toolbar/internal/useMountedRef";

function eventComingFromNodes(nodes: HTMLElement[], event: MouseEvent) {
  return nodes.some(
    (node) =>
      node != null &&
      (node === event.target || node.contains(event.target as HTMLElement))
  );
}

type clickAwayHook = (
  nodes: HTMLElement[] | (() => HTMLElement[]),
  containingDocument: HTMLDocument,
  onClickAway: (event: FocusEvent) => void,
  onClick: (event: MouseEvent) => void,
  mouseEvent?: string
) => void;

const useClickAway: clickAwayHook = (
  nodes,
  containingDocument,
  onClickAway,
  onClick = () => undefined,
  mouseEvent = "mouseup"
) => {
  // TODO can we get rid of this if it's just for IE11 ?
  const mountedRef = useMountedRef();

  const handleClickAway = useEventCallback((event: MouseEvent) => {
    // Ignore events that have been `event.preventDefault()` marked.
    if (event.defaultPrevented) {
      return;
    }

    // IE 11 support, which trigger the handleClickAway even after the unbind
    if (!mountedRef.current) {
      return;
    }

    onClick(event);

    if (!nodes) {
      return;
    }

    const resolvedNodes = typeof nodes === "function" ? nodes() : nodes;
    const isEventComingFromNodes = eventComingFromNodes(resolvedNodes, event);

    const ownerDocumentNode = resolvedNodes.find((node) =>
      // node could be null, e.g. left click on surrounding area of context menu examples
      node ? node.ownerDocument : false
    );
    const doc =
      containingDocument ||
      (ownerDocumentNode && ownerDocumentNode.ownerDocument);

    if (
      doc.documentElement &&
      doc.documentElement.contains(event.target as HTMLElement) &&
      !isEventComingFromNodes
    ) {
      onClickAway(event);
    }
  });

  useEffect(() => {
    if (containingDocument) {
      containingDocument.addEventListener(mouseEvent, handleClickAway);
      containingDocument.defaultView?.addEventListener("blur", onClickAway);
    }
    return () => {
      if (containingDocument) {
        containingDocument.removeEventListener(mouseEvent, handleClickAway);
        containingDocument.defaultView?.removeEventListener(
          "blur",
          onClickAway
        );
      }
    };
  }, [handleClickAway, mouseEvent, containingDocument, onClickAway]);
};

export default useClickAway;
