import {
  type FloatingFocusManager,
  useClick,
  useDismiss,
  useInteractions,
} from "@floating-ui/react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Scrim } from "../scrim";
import {
  makePrefixer,
  useFloatingComponent,
  useFloatingUI,
  useForkRef,
  useId,
} from "../utils";
import drawerCss from "./Drawer.css";
import { DrawerContext } from "./DrawerContext";
import { hasDrawerSection } from "./hasDrawerSection";
import { DrawerResizeHandle, useDrawerResize } from "./internal";

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
  variant?: "primary" | "secondary" | "tertiary";
  /**
   * Prevent the drawer closing on click away
   * */
  disableDismiss?: boolean;
  /**
   * Prevent Scrim from rendering
   * */
  disableScrim?: boolean;
  /**
   * Allow the user to resize the drawer by dragging its inner edge.
   * The handle occupies space inside the drawer's declared size rather than overlaying its
   * content, and does not consume the drawer's padding.
   * Limits come from the drawer's own CSS: `min-width`/`max-width` for `left` and `right`,
   * `min-height`/`max-height` for `top` and `bottom`.
   * */
  resizable?: boolean;
  /**
   * Which element to initially focus. Can be either a number (tabbable index as specified by the order) or a ref.
   * Default value is 0 (first tabbable element).
   * */
  initialFocus?: ComponentPropsWithoutRef<
    typeof FloatingFocusManager
  >["initialFocus"];
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
      resizable = false,
      initialFocus,
      id,
      style,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-drawer",
      css: drawerCss,
      window: targetWindow,
    });

    const drawerId = useId(id);

    const sectioned = hasDrawerSection(children);

    const [showComponent, setShowComponent] = useState(false);
    const [headerId, setHeaderId] = useState<string | undefined>(undefined);
    const [descriptionId, setDescriptionId] = useState<string | undefined>(
      undefined,
    );
    const { Component: FloatingComponent } = useFloatingComponent();

    const { context, floating, elements } = useFloatingUI({
      open: showComponent,
      onOpenChange,
    });

    const { getFloatingProps } = useInteractions([
      useClick(context),
      useDismiss(context, { outsidePress: !disableDismiss }),
    ]);

    const handleRef = useForkRef<HTMLDivElement>(floating, ref);

    const { size, isResizing, separatorProps } = useDrawerResize({
      enabled: resizable,
      position,
      element: elements.floating,
    });
    const sizeProperty =
      position === "left" || position === "right" ? "width" : "height";

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

    const contextValue = useMemo(
      () => ({
        drawerId,
        headerId,
        setHeaderId,
        descriptionId,
        setDescriptionId,
      }),
      [drawerId, headerId, descriptionId],
    );

    return (
      <DrawerContext.Provider value={contextValue}>
        <ConditionalScrimWrapper condition={showComponent && !disableScrim}>
          <FloatingComponent
            id={drawerId}
            open={showComponent}
            ref={handleRef}
            role={"dialog"}
            width={elements.floating?.offsetWidth}
            height={elements.floating?.offsetHeight}
            aria-modal="true"
            aria-labelledby={clsx(ariaLabelledBy, headerId) || undefined}
            aria-describedby={clsx(ariaDescribedBy, descriptionId) || undefined}
            focusManagerProps={{
              context: context,
              initialFocus,
              outsideElementsInert: true,
            }}
            className={clsx(
              withBaseName(),
              withBaseName(position),
              {
                [withBaseName("enterAnimation")]: open,
                [withBaseName("exitAnimation")]: !open,
                [withBaseName(variant)]: variant,
                [withBaseName("sectioned")]: sectioned,
                [withBaseName("resizable")]: resizable,
                [withBaseName("resizing")]: isResizing,
              },
              className,
            )}
            {...getFloatingProps()}
            {...rest}
            style={{
              ...style,
              ...(size !== undefined && { [sizeProperty]: size }),
            }}
          >
            {children}
            {resizable && (
              <DrawerResizeHandle
                position={position}
                resizing={isResizing}
                aria-label="Resize drawer"
                aria-controls={drawerId}
                {...separatorProps}
              />
            )}
          </FloatingComponent>
        </ConditionalScrimWrapper>
      </DrawerContext.Provider>
    );
  },
);
