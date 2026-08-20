import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "../utils";
import listItemActionsCss from "./ListItemActions.css";

export interface ListItemActionsProps extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltListItemActions");

/**
 * A trailing region for controls that are independent from the primary row
 * content or action.
 */
export const ListItemActions = forwardRef<HTMLDivElement, ListItemActionsProps>(
  function ListItemActions({ children, className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-list-item-actions",
      css: listItemActionsCss,
      window: targetWindow,
    });

    return (
      <div className={clsx(withBaseName(), className)} ref={ref} {...rest}>
        {children}
      </div>
    );
  },
);
