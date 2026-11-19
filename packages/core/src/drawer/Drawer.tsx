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
import {
  DrawerResizeGuide,
  DrawerResizeHandle,
  useDrawerResize,
} from "./internal";

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
   * Defines the Drawer's position on the screen.
   * @default "left"
   */
  position?: "left" | "top" | "right" | "bottom";
  /**
   * If `true`, the Drawer is shown. Use with `onOpenChange` to control it.
   */
  open?: boolean;
  /**
   * Callback fired when the open state changes, for example when the user
   * presses the Escape key or clicks outside the Drawer.
   */
  onOpenChange?: (newOpen: boolean) => void;
  /**
   * Change background color palette.
   */
  variant?: "primary" | "secondary" | "tertiary";
  /**
   * If `true`, the Drawer doesn't close when the user clicks outside it.
   */
  disableDismiss?: boolean;
  /**
   * If `true`, the `Scrim` isn't rendered.
   */
  disableScrim?: boolean;
  /**
   * If `true`, the user can resize the Drawer. Set size limits with the `--saltDrawer-minResize`/`--saltDrawer-maxResize`
   * variables, which apply to the width of `left` and `right` drawers and the height of `top` and `bottom` drawers.
   * The drawer never shrinks below `--salt-size-base`, unless `min-width`/`min-height` is set directly.
   */
  resizable?: boolean;
  /**
   * The element that receives focus when the Drawer opens: the index of a
   * tabbable element inside the Drawer, in tab order, or a ref to an element.
   * @default 0
   */
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
      onOpenChange: (newOpen, event) => {
        if (!newOpen && isCancelResizeEvent(event)) return;
        onOpenChange?.(newOpen);
      },
    });

    const {
      sizeStyle,
      isResizing,
      isHovered,
      isPlacing,
      isCancelResizeEvent,
      separatorProps,
      guideProps,
    } = useDrawerResize({
      enabled: resizable,
      position,
      element: elements.floating,
    });

    const { getFloatingProps } = useInteractions([
      useClick(context),
      useDismiss(context, {
        outsidePress: disableDismiss ? false : () => !isPlacing,
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
        position,
        resizable,
        headerId,
        setHeaderId,
        descriptionId,
        setDescriptionId,
      }),
      [drawerId, position, resizable, headerId, descriptionId],
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
            {resizable ? (
              // Keeps the content's scrollbar clear of the resize handle.
              <div className={withBaseName("inner")}>{children}</div>
            ) : (
              children
            )}
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
            {isPlacing && (
              <DrawerResizeGuide position={position} {...guideProps} />
            )}
          </FloatingComponent>
        </ConditionalScrimWrapper>
      </DrawerContext.Provider>
    );
  },
);
