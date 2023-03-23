import { cloneElement, forwardRef, isValidElement, ReactNode } from "react";
import { FloatingPortal } from "@floating-ui/react";
import { SaltProvider, useForkRef } from "@salt-ds/core";

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
  const handleRef = useForkRef(
    // @ts-ignore
    isValidElement(children) ? children.ref : null,
    ref
  );

  const container = getContainer(containerProp) ?? document.body;

  if (disablePortal) {
    if (isValidElement(children)) {
      return cloneElement(children, {
        ref: handleRef,
      });
    }
    return <>{children}</>;
  }

  return (
    <FloatingPortal root={container as HTMLElement} id={id}>
      <SaltProvider>{children}</SaltProvider>
    </FloatingPortal>
  );
});
