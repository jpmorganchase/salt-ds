import { makePrefixer, type RenderPropsType, renderProps } from "@salt-ds/core";
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
  /**
   * Render prop to customize the underlying list element. Defaults to a `<ul>`;
   */
  render?: RenderPropsType["render"];
}

export const MegaMenuItemList = forwardRef<
  HTMLUListElement,
  MegaMenuItemListProps
>(function MegaMenuItemList(
  { children, className, "aria-labelledby": ariaLabelledBy, render, ...rest },
  ref,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-mega-menu-item-list",
    css: megaMenuItemListCss,
    window: targetWindow,
  });

  const { headingId } = useMegaMenuGroup();

  return renderProps("ul", {
    className: clsx(withBaseName(), className),
    "aria-labelledby": clsx(headingId, ariaLabelledBy) || undefined,
    ref,
    render,
    ...rest,
    children: Children.map(children, (item, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: children have no stable identity
      <li key={index} className={withBaseName("item")}>
        {item}
      </li>
    )),
  });
});
