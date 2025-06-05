import { renderProps } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import verticalNavigationItemTriggerCss from "./VerticalNavigationItemTrigger.css";

function ItemAction(props) {
  return renderProps("a", props);
}

export function VerticalNavigationItemTrigger(props) {
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
      className={clsx("saltVerticalNavigationItem-trigger", className)}
      href={href}
      render={render ?? (isLink ? undefined : <button type="button" />)}
      {...rest}
    >
      {children}
    </ItemAction>
  );
}
