import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  Children,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useMegaMenuGroup } from "./MegaMenuGroupContext";
import megaMenuItemListCss from "./MegaMenuItemList.css";

const withBaseName = makePrefixer("saltMegaMenuItemList");

export interface MegaMenuItemListProps
  extends HTMLAttributes<HTMLUListElement> {
  /**
   * The items of the group, typically `MegaMenuItem` components. Each child is
   * wrapped in its own `<li>`.
   */
  children?: ReactNode;
}

export const MegaMenuItemList = forwardRef<
  HTMLUListElement,
  MegaMenuItemListProps
>(function MegaMenuItemList({ children, className, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-mega-menu-item-list",
    css: megaMenuItemListCss,
    window: targetWindow,
  });

  // Labelled by the sibling `MegaMenuGroupHeading`, whose id is shared via the
  // group context — no child inspection on either side.
  const { headingId } = useMegaMenuGroup() ?? {};

  return (
    <ul
      className={clsx(withBaseName(), className)}
      aria-labelledby={headingId}
      ref={ref}
      {...rest}
    >
      {Children.map(children, (item, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: children have no stable identity
        <li key={index} className={withBaseName("item")}>
          {item}
        </li>
      ))}
    </ul>
  );
});
