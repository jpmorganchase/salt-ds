import {
  forwardRef,
  ReactNode,
  useState,
  isValidElement,
  cloneElement,
  ReactElement,
} from "react";
import * as ReactDOM from "react-dom";
import { ToolkitProvider, useIsomorphicLayoutEffect } from "@jpmorganchase/uitk-core";
import { setRef, useForkRef } from "../utils";

export interface PortalProps {
  /**
   * The children to render into the `container`.
   */
  children?: ReactNode;
  /**
   * A HTML element, component instance, or function that returns either.
   * The `container` will have the portal children appended to it.
   *
   * By default, it uses the body of the top-level document object,
   * so it's simply `document.body` most of the time.
   */
  container?: Element;

  /**
   * Disable the portal behavior.
   * The children stay within it's parent DOM hierarchy.
   */
  disablePortal?: boolean;
}

/**
 * Portals provide a first-class way to render children into a DOM node
 * that exists outside the DOM hierarchy of the parent component.
 */
export const Portal = forwardRef(function Portal(
  { children, container = document.body, disablePortal = false }: PortalProps,
  ref
) {
  const [mountNode, setMountNode] = useState<Element | null>(null);
  const handleRef = useForkRef(
    // @ts-ignore
    isValidElement(children) ? children.ref : null,
    ref
  );

  useIsomorphicLayoutEffect(() => {
    if (!disablePortal) {
      setMountNode(container);
    }
  }, [container, disablePortal]);

  useIsomorphicLayoutEffect(() => {
    if (mountNode && !disablePortal) {
      setRef(ref, mountNode);
      return () => {
        setRef(ref, null);
      };
    }

    return undefined;
  }, [ref, mountNode, disablePortal]);

  if (disablePortal) {
    if (isValidElement(children)) {
      return cloneElement(children, {
        ref: handleRef,
      });
    }
    return children as ReactElement;
  }

  return mountNode
    ? ReactDOM.createPortal(
        <ToolkitProvider>{children}</ToolkitProvider>,
        mountNode
      )
    : mountNode;
});
