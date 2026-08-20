import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type DOMAttributes,
  type ElementType,
  forwardRef,
  type ReactNode,
} from "react";
import { makePrefixer } from "../utils";
import listItemContentCss from "./ListItemContent.css";

type StructuralComponentProps<T extends ElementType> = Omit<
  ComponentPropsWithoutRef<T>,
  | keyof DOMAttributes<Element>
  | "accessKey"
  | "autoFocus"
  | "contentEditable"
  | "draggable"
  | "role"
  | "suppressContentEditableWarning"
  | "tabIndex"
> & { children?: ReactNode };

export type ListItemContentProps = StructuralComponentProps<"span">;

const withBaseName = makePrefixer("saltCoreListItemContent");

/**
 * The passive content and first-line alignment area of a list row.
 */
export const ListItemContent = forwardRef<
  HTMLSpanElement,
  ListItemContentProps
>(function ListItemContent({ children, className, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-core-list-item-content",
    css: listItemContentCss,
    window: targetWindow,
  });

  return (
    <span className={clsx(withBaseName(), className)} ref={ref} {...rest}>
      {children}
    </span>
  );
});
