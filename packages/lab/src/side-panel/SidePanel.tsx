import { FloatingFocusManager } from "@floating-ui/react";
import { makePrefixer, useFloatingUI, useForkRef, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithRef,
  type CSSProperties,
  forwardRef,
  type KeyboardEvent,
  type MutableRefObject,
  useContext,
  useEffect,
  useState,
} from "react";
import sidePanelCss from "./SidePanel.css";
import { SidePanelGroupContext } from "./SidePanelGroupContext";

const withBaseName = makePrefixer("saltSidePanel");

export interface SidePanelProps extends ComponentPropsWithRef<"div"> {
  /**
   * Edge the panel is anchored to; controls animation direction and divider side.
   * @default "left"
   */
  position?: "left" | "right" | "top" | "bottom";
  /**
   * Which element to focus when the panel opens. Index (0 = first tabbable) or a ref.
   * @default 0
   */
  initialFocus?: number | MutableRefObject<HTMLElement | null>;
  /**
   * Whether the panel is open.
   */
  open?: boolean;
  /**
   * Callback when open state should change (e.g. Escape key pressed).
   */
  onOpenChange?: (newOpen: boolean) => void;
  /**
   * Change background color palette
   * @default "primary"
   */
  variant?: "primary" | "secondary" | "tertiary";
  /**
   * Height of the panel. Can be a number (pixels) or a CSS string value.
   */
  height?: number | string;
  /**
   * Width of the panel. Can be a number (pixels) or a CSS string value.
   */
  width?: number | string;
  /**
   * Reference to the trigger element for manual mode. Used to return focus when panel closes.
   * When inside SidePanelGroup, this is automatically managed via SidePanelTrigger.
   */
  triggerRef?: MutableRefObject<HTMLElement | null>;
}

export const SidePanel = forwardRef<HTMLDivElement, SidePanelProps>(
  function SidePanel(props, ref) {
    const {
      position = "left",
      initialFocus = 0,
      open: openProp = false,
      onOpenChange: onOpenChangeProp,
      variant = "primary",
      children,
      className,
      width,
      height,
      style,
      id: idProp,
      onKeyDownCapture,
      triggerRef: manualTriggerRef,
      ...rest
    } = props;
    const [showComponent, setShowComponent] = useState(false);
    const targetWindow = useWindow();
    const sidePanelGroup = useContext(SidePanelGroupContext);

    // In grouped mode, use group-provided ID (deterministic, immediate).
    // In manual/uncontrolled mode, generate and use own ID.
    const id = useId(idProp || sidePanelGroup?.panelId);

    const open = sidePanelGroup ? sidePanelGroup.open : openProp;
    const onOpenChange = sidePanelGroup
      ? sidePanelGroup.setOpen
      : onOpenChangeProp;

    // Use grouped trigger ref if available, otherwise use manual trigger ref
    const effectiveTriggerRef = sidePanelGroup?.triggerRef || manualTriggerRef;

    const { context, refs } = useFloatingUI({
      open,
      onOpenChange,
    });
    const { setReference, setFloating } = refs;

    // Wire trigger ref to floating reference for deterministic focus return
    useEffect(() => {
      if (effectiveTriggerRef?.current) {
        setReference(effectiveTriggerRef.current);
      }
    }, [effectiveTriggerRef, setReference]);

    const handleKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDownCapture?.(event);

      if (event.defaultPrevented || event.key !== "Escape") {
        return;
      }

      event.stopPropagation();
      onOpenChange?.(false);
    };

    const handleRef = useForkRef<HTMLDivElement>(setFloating, ref);

    useComponentCssInjection({
      testId: "salt-side-panel",
      css: sidePanelCss,
      window: targetWindow,
    });

    useEffect(() => {
      if (open) {
        setShowComponent(true);
        return;
      }
      const animate = setTimeout(() => {
        setShowComponent(false);
      }, 300); // var(--salt-duration-perceptible)
      return () => clearTimeout(animate);
    }, [open]);

    if (!showComponent) return null;

    const customStyle = {
      ...style,
      ...(width && {
        "--saltSidePanel-width":
          typeof width === "number" ? `${width}px` : width,
      }),
      ...(height && {
        "--saltSidePanel-height":
          typeof height === "number" ? `${height}px` : height,
      }),
    } as CSSProperties;

    const panelDiv = (
      <div
        ref={handleRef}
        className={clsx(
          withBaseName(),
          {
            [withBaseName(position)]: position,
            [withBaseName(variant)]: variant,
            [withBaseName("enterAnimation")]: open,
            [withBaseName("exitAnimation")]: !open,
          },
          className,
        )}
        style={customStyle}
        tabIndex={-1}
        role="region"
        id={id}
        onKeyDownCapture={handleKeyDownCapture}
        {...rest}
      >
        <div className={clsx(withBaseName("inner"))}>{children}</div>
      </div>
    );

    if (open) {
      return (
        <FloatingFocusManager
          context={context}
          modal={false}
          initialFocus={initialFocus}
          returnFocus
          closeOnFocusOut={false}
          guards={false}
        >
          {panelDiv}
        </FloatingFocusManager>
      );
    }

    return panelDiv;
  },
);
