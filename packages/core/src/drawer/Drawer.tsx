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
import type { DrawerResizeHandleBorder } from "./internal/DrawerResizeHandle";

interface ConditionalScrimWrapperProps extends PropsWithChildren {
  condition: boolean;
  className?: string;
}

const ConditionalScrimWrapper = ({
  condition,
  className,
  children,
}: ConditionalScrimWrapperProps) => {
  return condition ? (
    <Scrim fixed className={className}>
      {" "}
      {children}{" "}
    </Scrim>
  ) : (
    <>{children} </>
  );
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
   * Compose the drawer from `DrawerHeader`, `DrawerContent` and `DrawerFooter` when resizable,
   * so content scrolls inside `DrawerContent` rather than scrolling the drawer itself.
   * */
  resizable?: boolean;
  /**
   * Smallest size in px the drawer can be resized to. Applies to the width for a `left` or
   * `right` drawer, and to the height for a `top` or `bottom` drawer.
   * */
  minSize?: number;
  /**
   * Largest size in px the drawer can be resized to. Defaults to the size of the viewport
   * along the resize axis.
   * */
  maxSize?: number;
  /**
   * Size in px the drawer starts at. When omitted, the drawer keeps the size set by CSS until
   * it is resized.
   * */
  defaultSize?: number;
  /**
   * Called with the new size in px each time the drawer is resized.
   * */
  onResize?: (size: number) => void;
  /**
   * Sides of the resize handle to render a border on. No borders are rendered by default.
   * `left` and `right` apply to a `left` or `right` drawer, `top` and `bottom` to a `top`
   * or `bottom` drawer; a side that does not run along the handle is ignored.
   * */
  resizeHandleBorders?: DrawerResizeHandleBorder[];
  /**
   * Accessible name for the resize handle. Defaults to "Resize drawer".
   * */
  resizeHandleLabel?: string;
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
      resizeHandleBorders,
      resizeHandleLabel = "Resize drawer",
      minSize,
      maxSize,
      defaultSize,
      onResize,
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

    useEffect(() => {
      if (process.env.NODE_ENV !== "production") {
        if (resizable && !sectioned) {
          console.warn(
            "A resizable Drawer should be composed from DrawerHeader, DrawerContent and DrawerFooter. A resizable Drawer does not scroll itself, so content outside DrawerContent may be clipped.",
          );
        }
      }
    }, [resizable, sectioned]);

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
      minSize,
      maxSize,
      defaultSize,
      onResize,
    });
    const sizeProperty =
      position === "left" || position === "right" ? "width" : "height";

    const borderSidesAlongHandle = useMemo<DrawerResizeHandleBorder[]>(
      () => (sizeProperty === "width" ? ["left", "right"] : ["top", "bottom"]),
      [sizeProperty],
    );
    const resizeHandleBordersKey = resizeHandleBorders?.join(",");

    useEffect(() => {
      if (process.env.NODE_ENV !== "production") {
        const ignored = resizeHandleBordersKey
          ?.split(",")
          .filter(
            (side) =>
              !borderSidesAlongHandle.includes(
                side as DrawerResizeHandleBorder,
              ),
          );
        if (ignored?.length) {
          console.warn(
            `Drawer ignored resizeHandleBorders "${ignored.join('", "')}". A ${position} drawer's resize handle only supports the "${borderSidesAlongHandle.join('" and "')}" sides.`,
          );
        }
      }
    }, [resizeHandleBordersKey, borderSidesAlongHandle, position]);

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
        <ConditionalScrimWrapper
          condition={showComponent && !disableScrim}
          className={clsx({
            [withBaseName("resizingHorizontal")]:
              isResizing && sizeProperty === "width",
            [withBaseName("resizingVertical")]:
              isResizing && sizeProperty === "height",
          })}
        >
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
                borders={resizeHandleBorders?.filter((side) =>
                  borderSidesAlongHandle.includes(side),
                )}
                aria-label={resizeHandleLabel}
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
