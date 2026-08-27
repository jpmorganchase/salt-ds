import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
  useEffect,
} from "react";
import { StatusIndicator, type ValidationStatus } from "../status-indicator";
import { H2, Text } from "../text";
import { makePrefixer, useId } from "../utils";
import { useDrawerContext } from "./DrawerContext";
import drawerHeaderCss from "./DrawerHeader.css";

const withBaseName = makePrefixer("saltDrawerHeader");

export interface DrawerHeaderProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The status of the Drawer
   */
  status?: ValidationStatus | undefined;
  /**
   * Displays the accent bar in the Drawer Title */
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
      status,
      ...rest
    } = props;
    const { setId: setHeaderId, id: contextHeaderId } = useDrawerContext();

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-drawer-header",
      css: drawerHeaderCss,
      window: targetWindow,
    });

    const headerId = useId(contextHeaderId);

    useEffect(() => {
      if (headerId) {
        setHeaderId?.(headerId);
      }
    }, [headerId, setHeaderId]);

    return (
      <div
        className={clsx(
          withBaseName(),
          {
            [withBaseName("withAccent")]: !disableAccent && !status,
            [withBaseName(status ?? "")]: !!status,
          },
          className,
        )}
        ref={ref}
        {...rest}
      >
        {status && <StatusIndicator status={status} />}
        <div className={withBaseName("container")}>
          <H2 id={headerId} className={withBaseName("header")}>
            {preheader && <Text color="primary">{preheader}</Text>}
            {header}
          </H2>
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
