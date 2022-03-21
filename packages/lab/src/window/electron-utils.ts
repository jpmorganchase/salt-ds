import {
  ReactChild,
  ReactFragment,
  ReactPortal,
  Ref,
  useMemo,
  Children,
  isValidElement,
} from "react";
import { setRef } from "../utils";

const globalObject = typeof global === "undefined" ? window : global;
export const isElectron: boolean = (globalObject as any).isElectron;

const forwardedProperties = new Set([
  "ownerDocument",
  "document",
  "nodeName",
  "offsetWidth",
  "offsetHeight",
  "parentNode",
]);

export function getChildrenNames(
  children:
    | boolean
    | ReactChild
    | ReactFragment
    | ReactPortal
    | null
    | undefined,
  components: Set<any>
) {
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      return;
    }
    if (child.props.children) {
      getChildrenNames(child.props.children, components);
    }
    if (typeof child.type !== "string") {
      // @ts-ignore
      if (child.type.render?.name)
        // @ts-ignore
        components.add(child.type.render.name);
    }
  });
}

export function useProxyRef<Instance>(
  ref: Ref<Instance>
): Ref<Instance> | null {
  return useMemo(() => {
    return (refValue) => {
      const target = {
        element: refValue,
      };
      const handler = {
        // @ts-ignore
        get: (target, prop) => {
          if (forwardedProperties.has(prop)) {
            // @ts-ignore
            return refValue[prop];
          } else if (prop === "toString") {
            return () => target.element.toString();
          } else if (prop === "assignedSlot" || prop === "contextElement") {
            return undefined;
          } else {
            throw `unexpected property access: ${prop}`;
          }
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const proxy = new Proxy(target, handler);
      if (refValue == null) {
        return null;
      }
      setRef(ref, proxy as unknown as Instance);
    };
  }, [ref]);
}
