import { Middleware } from "@floating-ui/core";
import { MiddlewareArguments } from "@floating-ui/react-dom-interactions";

export const margin = (value = 0): Middleware => ({
  name: "margin",
  options: value,
  fn(middlewareArguments: MiddlewareArguments) {
    const { x, y, elements } = middlewareArguments;

    if (elements.floating.children.length > 0) {
      const rootChildElement = elements.floating.children[0] as HTMLElement;
      rootChildElement.style.setProperty("margin", value.toString());
    }
    return {
      x: x,
      y: y,
    };
  },
});
