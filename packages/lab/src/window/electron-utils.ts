import {
  ReactChild,
  ReactFragment,
  ReactPortal,
  Children,
  isValidElement,
} from "react";

const globalObject = typeof global === "undefined" ? window : global;
export const isElectron: boolean = (globalObject as any).isElectron;

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
