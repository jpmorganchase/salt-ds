import { useClick, useDismiss, useInteractions } from "@floating-ui/react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type PropsWithChildren,
  useEffect,
  useState,
} from "react";
import { Scrim } from "../scrim";
import {
  makePrefixer,
  useFloatingComponent,
  useFloatingUI,
  useForkRef,
} from "../utils";
import drawerCss from "./Drawer.css";

interface ConditionalScrimWrapperProps extends PropsWithChildren {
  condition: boolean;
}

const ConditionalScrimWrapper = ({
  condition,
  children,
}: ConditionalScrimWrapperProps) => {
  return condition ? <Scrim fixed> {children} </Scrim> : <>{children} </>;
};

export interface DrawerProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Defines the drawer position within the screen. Defaults to `left`.
   */
  position?: "left" | "top" | "right" | "bottom";
  /**
   * Display or hide the component.
   */
  open?: boolean;
  /**
   * Callback function triggered when open state changes.
   */
  onOpenChange?: (newOpen: boolean) => void;
  /**
   * Change background color palette
   */
  variant?: "primary" | "secondary";
  /**
   * Prevent the dialog closing on click away
   * */
  disableDismiss?: boolean;
  /**
   * Prevent Scrim from rendering
   * */
  disableScrim?: boolean;
}

const withBaseName = makePrefixer("saltDrawer");

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  function Drawer(props, ref) {
    const {
      children,
      className,
      position = "left",
      open = false,
      onOpenChange,
      variant = "primary",
      disableDismiss,
      disableScrim,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-drawer",
      css: drawerCss,
      window: targetWindow,
    });

    const [showComponent, setShowComponent] = useState(false);
    const { Component: FloatingComponent } = useFloatingComponent();

    const { context, floating, elements } = useFloatingUI({
      open: showComponent,
      onOpenChange,
    });

    const { getFloatingProps } = useInteractions([
      useClick(context),
      useDismiss(context, { enabled: !disableDismiss }),
    ]);

    const handleRef = useForkRef<HTMLDivElement>(floating, ref);

    useEffect(() => {
      if (open && !showComponent) {
        setShowComponent(true);
      }

      if (!open && showComponent) {
        const animate = setTimeout(() => {
          setShowComponent(false);
        }, 300); // var(--salt-duration-perceptible)
        return () => clearTimeout(animate);
      }
    }, [open, showComponent]);

    return (
      <ConditionalScrimWrapper condition={showComponent && !disableScrim}>
        <FloatingComponent
          open={showComponent}
          ref={handleRef}
          role={"dialog"}
          width={elements.floating?.offsetWidth}
          height={elements.floating?.offsetHeight}
          aria-modal="true"
          focusManagerProps={{
            context: context,
          }}
          className={clsx(
            withBaseName(),
            withBaseName(position),
            {
              [withBaseName("enterAnimation")]: open,
              [withBaseName("exitAnimation")]: !open,
              [withBaseName(variant)]: variant,
            },
            className,
          )}
          {...getFloatingProps()}
          {...rest}
        >
          {children}
        </FloatingComponent>
      </ConditionalScrimWrapper>
    );
  },
);
