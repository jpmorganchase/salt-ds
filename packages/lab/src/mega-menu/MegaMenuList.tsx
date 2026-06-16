import { makePrefixer, type RenderPropsType, renderProps } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { useMegaMenuGroup } from "./MegaMenuGroupContext";
import megaMenuListCss from "./MegaMenuList.css";

const withBaseName = makePrefixer("saltMegaMenuList");

export interface MegaMenuListProps extends HTMLAttributes<HTMLUListElement> {
  /**
   * The items of the group, typically `MegaMenuListItem` components. Each
   * `MegaMenuListItem` renders its own `<li>`.
   */
  children?: ReactNode;
  /**
   * Render prop to customize the underlying list element. Defaults to a `<ul>`;
   */
  render?: RenderPropsType["render"];
}

export const MegaMenuList = forwardRef<HTMLUListElement, MegaMenuListProps>(
  function MegaMenuList(
    { children, className, "aria-labelledby": ariaLabelledBy, render, ...rest },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-list",
      css: megaMenuListCss,
      window: targetWindow,
    });

    const { headingId } = useMegaMenuGroup();

    return renderProps("ul", {
      className: clsx(withBaseName(), className),
      "aria-labelledby": clsx(headingId, ariaLabelledBy) || undefined,
      ref,
      render,
      ...rest,
      children,
    });
  },
);
