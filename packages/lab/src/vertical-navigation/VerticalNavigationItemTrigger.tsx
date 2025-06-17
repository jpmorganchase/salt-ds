import { makePrefixer, type RenderPropsType, renderProps } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import verticalNavigationItemTriggerCss from "./VerticalNavigationItemTrigger.css";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function ItemAction(props: any) {
  return renderProps("a", props);
}

export interface VerticalNavigationItemTriggerProps
  extends ComponentPropsWithoutRef<"a"> {
  render?: RenderPropsType["render"];
}

const withBaseName = makePrefixer("saltVerticalNavigationItemTrigger");

export const VerticalNavigationItemTrigger = forwardRef<
  HTMLAnchorElement,
  VerticalNavigationItemTriggerProps
>(function VerticalNavigationItemTrigger(props, ref) {
  const { className, children, render, href, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-vertical-navigation-item-trigger",
    css: verticalNavigationItemTriggerCss,
    window: targetWindow,
  });

  const isLink = href != null;

  return (
    <ItemAction
      className={clsx(withBaseName(), className)}
      href={href}
      render={render ?? (isLink ? undefined : <button type="button" />)}
      ref={ref}
      {...rest}
    >
      {children}
    </ItemAction>
  );
});
