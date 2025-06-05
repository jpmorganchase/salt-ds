import { makePrefixer, renderProps } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import verticalNavigationItemCss from "./VerticalNavigationItem.css";

export interface VerticalNavigationItemProps
  extends Omit<ComponentPropsWithoutRef<"li">, "onClick">,
    Pick<ComponentPropsWithoutRef<"a">, "onClick" | "href"> {
  active?: boolean;
  /**
   * Render prop to enable customisation of navigation item element.
   */
  render?: RenderPropsType["render"];
}

const withBaseName = makePrefixer("saltVerticalNavigationItem");

function ItemAction(props) {
  return renderProps("a", props);
}

export const VerticalNavigationItem = forwardRef<
  HTMLLIElement,
  VerticalNavigationItemProps
>(function VerticalNavigationItem(props, ref) {
  const { children, className, href, active, onClick, render, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-vertical-navigation-item",
    css: verticalNavigationItemCss,
    window: targetWindow,
  });

  const isLink = href !== undefined;

  return (
    <li
      ref={ref}
      className={clsx(
        withBaseName(),
        {
          [withBaseName("active")]: active,
        },
        className,
      )}
      {...rest}
    >
      <ItemAction
        className={withBaseName("trigger")}
        href={href}
        onClick={onClick}
        render={render ?? (isLink ? undefined : <button type="button" />)}
      >
        {children}
      </ItemAction>
    </li>
  );
});
