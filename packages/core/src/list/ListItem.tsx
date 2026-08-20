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
import listItemCss from "./ListItem.css";

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

export type ListItemProps = StructuralComponentProps<"li">;

const withBaseName = makePrefixer("saltCoreListItem");

/**
 * A structural list row. Interaction belongs to its action children.
 */
export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(
  function ListItem({ children, className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-core-list-item",
      css: listItemCss,
      window: targetWindow,
    });

    return (
      <li className={clsx(withBaseName(), className)} ref={ref} {...rest}>
        {children}
      </li>
    );
  },
);
