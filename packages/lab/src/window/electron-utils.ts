import { setRef } from "@jpmorganchase/uitk-core";
import { Ref, useMemo } from "react";

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
            if (target.element && target.element.toString) {
              return () => target.element.toString();
            } else {
              return () => undefined;
            }
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
