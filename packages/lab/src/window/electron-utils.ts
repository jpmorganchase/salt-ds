import {
  ReactChild,
  ReactFragment,
  ReactPortal,
  Children,
  isValidElement,
} from "react";

const globalObject = typeof global === "undefined" ? window : global;
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (child.props.children) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      getChildrenNames(child.props.children, components);
    }
    if (typeof child.type !== "string") {
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (child.type.render?.name)
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        components.add(child.type.render.name);
    }
  });
}
