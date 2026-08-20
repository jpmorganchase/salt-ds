import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "../utils";
import listItemCss from "./ListItem.css";

export interface ListItemProps extends ComponentPropsWithoutRef<"li"> {}

const withBaseName = makePrefixer("saltListItem");

/**
 * A structural list row. Interaction belongs to its action children.
 */
export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(
  function ListItem({ children, className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-list-item",
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
