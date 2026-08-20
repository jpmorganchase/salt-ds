import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer, type RenderPropsType, renderProps } from "../utils";
import listCss from "./List.css";

export interface ListProps extends ComponentPropsWithoutRef<"ul"> {
  /**
   * Render prop to enable customization of the list element.
   */
  render?: RenderPropsType["render"];
}

const withBaseName = makePrefixer("saltList");

/**
 * A structural list for passive and independently actionable rows.
 */
export const List = forwardRef<HTMLUListElement, ListProps>(function List(
  { children, className, render, ...rest },
  ref,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-list",
    css: listCss,
    window: targetWindow,
  });

  return renderProps("ul", {
    ...rest,
    className: clsx(withBaseName(), className),
    ref,
    render,
    children,
  });
});
