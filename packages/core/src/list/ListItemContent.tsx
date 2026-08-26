import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "../utils";
import listItemContentCss from "./ListItemContent.css";

export interface ListItemContentProps
  extends ComponentPropsWithoutRef<"span"> {}

const withBaseName = makePrefixer("saltListItemContent");

/**
 * The static content and first-line alignment area of a list row.
 */
export const ListItemContent = forwardRef<
  HTMLSpanElement,
  ListItemContentProps
>(function ListItemContent({ children, className, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-list-item-content",
    css: listItemContentCss,
    window: targetWindow,
  });

  return (
    <span className={clsx(withBaseName(), className)} ref={ref} {...rest}>
      {children}
    </span>
  );
});
