import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { useVerticalNavigationItem } from "./VerticalNavigationItem";
import verticalNavigationItemContentCss from "./VerticalNavigationItemContent.css";

export interface VerticalNavigationItemContentProps
  extends ComponentPropsWithoutRef<"span"> {}

const withBaseName = makePrefixer("saltVerticalNavigationItemContent");

export const VerticalNavigationItemContent = forwardRef<
  HTMLSpanElement,
  VerticalNavigationItemContentProps
>(function VerticalNavigationItemContent(props, ref) {
  const { children, className, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-vertical-navigation-item-content",
    css: verticalNavigationItemContentCss,
    window: targetWindow,
  });

  const { active } = useVerticalNavigationItem();

  return (
    <span
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
      {children}
    </span>
  );
});
