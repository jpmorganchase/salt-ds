import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";
import { H2, Text } from "../text";
import { makePrefixer, useId, useIsomorphicLayoutEffect } from "../utils";
import { useOverlayContext } from "./OverlayContext";
import overlayHeaderCss from "./OverlayHeader.css";

const withBaseName = makePrefixer("saltOverlayHeader");

export interface OverlayHeaderProps extends ComponentPropsWithoutRef<"div"> {
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

export const OverlayHeader = forwardRef<HTMLDivElement, OverlayHeaderProps>(
  function OverlayHeader(props, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-overlay-header",
      css: overlayHeaderCss,
      window: targetWindow,
    });

    const { className, description, header, actions, preheader, ...rest } =
      props;

    const { setHeaderId, setDescriptionId } = useOverlayContext();

    const headingId = useId();
    const descriptionId = useId();
    const hasHeading = Boolean(header || preheader);
    const hasDescription = Boolean(description);

    useIsomorphicLayoutEffect(() => {
      setHeaderId?.(hasHeading ? headingId : undefined);

      return () => {
        setHeaderId?.(undefined);
      };
    }, [hasHeading, headingId, setHeaderId]);

    useIsomorphicLayoutEffect(() => {
      setDescriptionId?.(hasDescription ? descriptionId : undefined);

      return () => {
        setDescriptionId?.(undefined);
      };
    }, [hasDescription, descriptionId, setDescriptionId]);

    return (
      <div className={clsx(withBaseName(), className)} {...rest} ref={ref}>
        <div className={withBaseName("container")}>
          {hasHeading && (
            <H2 id={headingId} styleAs="h4" className={withBaseName("header")}>
              {preheader && <Text color="primary">{preheader}</Text>}
              {header}
            </H2>
          )}
          {description && (
            <Text
              id={descriptionId}
              color="secondary"
              className={withBaseName("description")}
            >
              {description}
            </Text>
          )}
        </div>
        {actions && (
          <div className={withBaseName("actionsContainer")}>{actions}</div>
        )}
      </div>
    );
  },
);
