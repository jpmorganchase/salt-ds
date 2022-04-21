import { Middleware } from "@floating-ui/core";

export const margin = (value = 0): Middleware => ({
  name: "margin",
  options: value,
  fn(middlewareArguments) {
    const { x, y, elements } = middlewareArguments;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (elements.floating.children.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      elements.floating.children[0].style.setProperty(
        "margin",
        value.toString()
      );
      // const marginBottom = value+1;
      // // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      // elements.floating.children[0].style.setProperty("margin-bottom", marginBottom.toString());
    }
    return {
      x: x,
      y: y,
    };
  },
});
