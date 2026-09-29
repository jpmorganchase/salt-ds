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
   * Allow the user to resize the drawer. Set size limits with the `--saltDrawer-minWidth`/`--saltDrawer-maxWidth`
   * variables (`--saltDrawer-minHeight`/`--saltDrawer-maxHeight` for `top` and `bottom`). The drawer never shrinks
   * below `--salt-size-base`, unless `min-width`/`min-height` is set directly.
   * */
  resizable?: boolean;
  /**
   * Size of the drawer in px, to be used when in a controlled state.
   * Width for `left` and `right` drawers, height for `top` and `bottom` drawers.
   * When not set, the drawer starts at its CSS size.
   * */
  size?: number;
  /**
   * Callback called when the drawer is resized.
   * It provides a generic event and the new size in px.
   * */
  onResize?: (event: Event, size: number) => void;
  /**
   * Callback called when the handle stops being dragged or is moved from the keyboard.
   * It provides a generic event and the new size in px.
   * */
  onResizeEnd?: (event: Event, size: number) => void;
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
      size,
      onResize,
      onResizeEnd,
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

    const { sizeStyle, isResizing, isHovered, isInHitArea, separatorProps } =
      useDrawerResize({
        enabled: resizable,
        position,
        element: elements.floating,
        size,
        onResize,
        onResizeEnd,
      });

    const { getFloatingProps } = useInteractions([
      useClick(context),
      useDismiss(context, {
        outsidePress: disableDismiss ? false : (event) => !isInHitArea(event),
      }),
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
              ...sizeStyle,
            }}
          >
            {children}
            {resizable && (
              <DrawerResizeHandle
                position={position}
                resizing={isResizing}
                hovered={isHovered}
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
