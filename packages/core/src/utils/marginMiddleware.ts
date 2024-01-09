import { Middleware } from "@floating-ui/core";

export const margin = (value = 0): Middleware => ({
  name: "margin",
  options: value,
  fn(middlewareState) {
    const { x, y, elements } = middlewareState;

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
