import {
  cloneElement,
  forwardRef,
  isValidElement,
  ReactElement,
  ReactNode,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ToolkitProvider } from "../toolkit-provider";
import { ownerDocument, useForkRef, useIsomorphicLayoutEffect } from "../utils";

export interface PortalProps {
  /**
   * The children to render into the `container`.
   */
  children?: ReactNode;
  /**
   * An HTML element, component instance, or function that returns either.
   * The `container` will have the portal children appended to it.
   *
   * By default, it uses the body of the top-level document object,
   * so it's simply `document.body` most of the time.
   */
  container?: Element | (() => Element | null) | null;
  /**
   * Disable the portal behavior.
   * The children stay within it's parent DOM hierarchy.
   */
  disablePortal?: boolean;
  /**
   * If this node does not exist on the document, it will be created for you.
   */
  id?: string;
}

function getContainer(container: PortalProps["container"]) {
  return typeof container === "function" ? container() : container;
}

const DEFAULT_ID = "portal-root";

/**
 * Portals provide a first-class way to render children into a DOM node
 * that exists outside the DOM hierarchy of the parent component.
 */
export const Portal = forwardRef<HTMLElement, PortalProps>(function Portal(
  {
    children,
    container: containerProp = document.body,
    disablePortal = false,
    id = DEFAULT_ID,
  },
  ref
) {
  const [mounted, setMounted] = useState(false);
  const portalRef = useRef<HTMLElement | null>(null);
  const handleRef = useForkRef(
    // @ts-ignore
    isValidElement(children) ? children.ref : null,
    ref
  );

  const container = getContainer(containerProp) ?? document.body;

  useIsomorphicLayoutEffect(() => {
    const root = ownerDocument(container).getElementById(id);

    if (root) {
      portalRef.current = root;
    } else {
      portalRef.current = ownerDocument(container).createElement("div");
      portalRef.current.id = id;
    }

    const el = portalRef.current;

    if (!container.contains(el)) {
      container.appendChild(el);
    }

    setMounted(true);
  }, [id, container]);

  if (disablePortal) {
    if (isValidElement(children)) {
      return cloneElement(children, {
        ref: handleRef,
      });
    }
    return children as ReactElement;
  }

  if (mounted && portalRef.current && children) {
    return createPortal(
      <ToolkitProvider>{children}</ToolkitProvider>,
      portalRef.current
    );
  }

  return null;
});
