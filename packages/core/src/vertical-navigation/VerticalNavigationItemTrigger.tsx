import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type FocusEvent,
  forwardRef,
  type MouseEvent,
  useRef,
} from "react";
import { makePrefixer, type RenderPropsType, renderProps } from "../utils";
import { useVerticalNavigationItem } from "./VerticalNavigationItem";
import verticalNavigationItemTriggerCss from "./VerticalNavigationItemTrigger.css";

// biome-ignore lint/suspicious/noExplicitAny: We don't know the exact type here
function ItemAction(props: ComponentPropsWithoutRef<any>) {
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
  const {
    className,
    children,
    render,
    href,
    onFocus,
    onBlur,
    onMouseDown,
    ...rest
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-vertical-navigation-item-trigger",
    css: verticalNavigationItemTriggerCss,
    window: targetWindow,
  });

  const isLink = href != null;
  const { active, setFocusVisible } = useVerticalNavigationItem();

  const wasMouseDownRef = useRef(false);

  const handleFocus = (event: FocusEvent<never>) => {
    if (!wasMouseDownRef.current) {
      setFocusVisible(true);
    }
    wasMouseDownRef.current = false;
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<never>) => {
    setFocusVisible(false);
    onBlur?.(event);
  };

  const handleMouseDown = (event: MouseEvent<never>) => {
    wasMouseDownRef.current = true;
    onMouseDown?.(event);
  };

  return (
    <ItemAction
      className={clsx(withBaseName(), className)}
      href={href}
      aria-current={active ? "page" : undefined}
      render={render ?? (isLink ? undefined : <button type="button" />)}
      ref={ref}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseDown={handleMouseDown}
      {...rest}
    >
      {children}
    </ItemAction>
  );
});
