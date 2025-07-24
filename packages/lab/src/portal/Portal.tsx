import {
  getRefFromChildren,
  ownerDocument,
  SaltProvider,
  useForkRef,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactNode,
  type Ref,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

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
  ref,
) {
  const [mounted, setMounted] = useState(false);
  const portalRef = useRef<HTMLElement | null>(null);
  const handleRef = useForkRef(getRefFromChildren(children), ref);

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
    if (isValidElement<{ ref?: Ref<unknown> }>(children)) {
      return cloneElement(children, {
        ref: handleRef,
      });
    }
    return <>{children}</>;
  }

  if (mounted && portalRef.current && children) {
    return createPortal(
      <SaltProvider>{children}</SaltProvider>,
      portalRef.current,
    );
  }

  return null;
});
