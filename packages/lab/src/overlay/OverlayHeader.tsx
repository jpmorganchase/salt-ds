import { Text, makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  forwardRef,
} from "react";
import overlayHeaderCss from "./OverlayHeader.css";

const withBaseName = makePrefixer("saltOverlayHeader");

export interface OverlayHeaderContentProps
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * Description text is displayed just below the header
   **/
  description?: ReactNode;
  /**
   * Actions to be displayed in header
   */
  actions?: ReactNode;
  /**
   * Header text
   */
  header?: ReactNode;
  /**
   * Preheader text is displayed just above the header
   **/
  preheader?: ReactNode;
}

export const OverlayHeader = forwardRef<
  HTMLDivElement,
  OverlayHeaderContentProps
>(function OverlayHeaderContent(props, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-overlay-header-content",
    css: overlayHeaderCss,
    window: targetWindow,
  });

  const { className, description, header, actions, preheader, ...rest } = props;

  return (
    <div className={clsx(withBaseName(), className)} {...rest} ref={ref}>
      <div className={withBaseName("container")}>
        <div className={withBaseName("header")}>
          {preheader && (
            <Text className={withBaseName("preheader")}>{preheader}</Text>
          )}
          {header}
        </div>
        {description && (
          <Text color="secondary" className={withBaseName("description")}>
            {description}
          </Text>
        )}
      </div>
      {actions && (
        <div className={withBaseName("actionsContainer")}>{actions}</div>
      )}
    </div>
  );
});
