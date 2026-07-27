import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type MouseEvent } from "react";
import { Button, type ButtonProps } from "../button";
import { useIcon } from "../semantic-icon-provider";
import { makePrefixer } from "../utils";
import verticalNavigationCollapseTriggerCss from "./VerticalNavigationCollapseTrigger.css";
import { useVerticalNavigationContext } from "./VerticalNavigationContext";

export interface VerticalNavigationCollapseTriggerProps extends ButtonProps {}

const withBaseName = makePrefixer("saltVerticalNavigationCollapseTrigger");

export const VerticalNavigationCollapseTrigger = forwardRef<
  HTMLButtonElement,
  VerticalNavigationCollapseTriggerProps
>(function VerticalNavigationCollapseTrigger(props, ref) {
  const { className, onClick, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-vertical-navigation-collapse-trigger",
    css: verticalNavigationCollapseTriggerCss,
    window: targetWindow,
  });

  const { CollapseLeftIcon, CollapseRightIcon } = useIcon();
  const { collapsed, setCollapsed, navId } = useVerticalNavigationContext();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    setCollapsed(event, !collapsed);
  };

  return (
    // Not a navigation destination, so it's removed from the list semantics.
    <li className={withBaseName("wrapper")} role="none">
      <Button
        ref={ref}
        aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        aria-expanded={!collapsed}
        aria-controls={navId}
        appearance="transparent"
        className={clsx(withBaseName(), className)}
        onClick={handleClick}
        {...rest}
      >
        {collapsed ? (
          <CollapseRightIcon aria-hidden />
        ) : (
          <CollapseLeftIcon aria-hidden />
        )}
      </Button>
    </li>
  );
});
