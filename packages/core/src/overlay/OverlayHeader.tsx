import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  forwardRef,
} from "react";
import { H3, Text } from "../text";
import { makePrefixer } from "../utils";
import overlayHeaderCss from "./OverlayHeader.css";

const withBaseName = makePrefixer("saltOverlayHeader");

export interface OverlayPanelContentProps
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * Description text is displayed just below the header
   **/
  description?: string;
  /**
   * End adornment component
   */
  endAdornment?: ReactNode;
  /**
   * Header text
   */
  header?: string;
  /**
   * The id of the Overlay Header, used for aria-labelledby on OverlayPanel
   **/
  id?: string;
  /**
   * Preheader text is displayed just above the header
   **/
  preheader?: string;
}

export const OverlayHeader = forwardRef<
  HTMLDivElement,
  OverlayPanelContentProps
>(function OverlayPanelContent(props, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-overlay-panel-content",
    css: overlayHeaderCss,
    window: targetWindow,
  });

  const {
    className,
    description,
    header,
    endAdornment,
    id,
    preheader,
    ...rest
  } = props;

  return (
    <div className={clsx(withBaseName(), className)} {...rest} ref={ref}>
      <div className={withBaseName("body")}>
        {preheader && (
          <Text className={withBaseName("preheader")}>{preheader}</Text>
        )}
        {header && (
          <H3 id={id} className={withBaseName("header")}>
            {header}
          </H3>
        )}
        {description && (
          <Text color="secondary" className={withBaseName("description")}>
            {description}
          </Text>
        )}
      </div>
      {endAdornment && (
        <div className={withBaseName("endAdornmentContainer")}>
          {endAdornment}
        </div>
      )}
    </div>
  );
});
