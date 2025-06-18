import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import staticListItemContent from "./StaticListItemContent.css";

const withBaseName = makePrefixer("saltStaticListItemContent");

export interface StaticListItemContentProps
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of Static List Item
   */
  children?: ReactNode;
}

export const StaticListItemContent = forwardRef<
  HTMLDivElement,
  StaticListItemContentProps
>(function StaticListItemContent({ children, className, ...restProps }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-static-list-item-content",
    css: staticListItemContent,
    window: targetWindow,
  });

  return (
    <div className={clsx(withBaseName(), className)} {...restProps} ref={ref}>
      {children}
    </div>
  );
});
