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
import { useDrawerContext } from "./DrawerContext";
import drawerHeaderCss from "./DrawerHeader.css";

const withBaseName = makePrefixer("saltDrawerHeader");

export interface DrawerHeaderProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Hides the accent bar in the Drawer Header. Defaults to `false`.
   */
  disableAccent?: boolean;
  /**
   * Displays the header at the top of the Drawer
   */
  header: ReactNode;
  /**
   * Displays the preheader just above the header
   **/
  preheader?: ReactNode;
  /**
   * Description text is displayed just below the header
   **/
  description?: ReactNode;
  /**
   * Actions to be displayed in header
   */
  actions?: ReactNode;
}

export const DrawerHeader = forwardRef<HTMLDivElement, DrawerHeaderProps>(
  function DrawerHeader(props, ref) {
    const {
      actions,
      className,
      description,
      disableAccent,
      header,
      preheader,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-drawer-header",
      css: drawerHeaderCss,
      window: targetWindow,
    });

    const { setHeaderId, setHasHeader } = useDrawerContext();
    const headingId = useId();
    const hasHeading = Boolean(header || preheader);

    useIsomorphicLayoutEffect(() => {
      setHasHeader?.(true);

      return () => {
        setHasHeader?.(false);
      };
    }, [setHasHeader]);

    useIsomorphicLayoutEffect(() => {
      setHeaderId?.(hasHeading ? headingId : undefined);

      return () => {
        setHeaderId?.(undefined);
      };
    }, [hasHeading, headingId, setHeaderId]);

    return (
      <div
        className={clsx(
          withBaseName(),
          {
            [withBaseName("withAccent")]: !disableAccent,
          },
          className,
        )}
        ref={ref}
        {...rest}
      >
        <div className={withBaseName("container")}>
          {hasHeading && (
            <H2 id={headingId} className={withBaseName("header")}>
              {preheader && <Text color="primary">{preheader}</Text>}
              {header}
            </H2>
          )}
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
  },
);
