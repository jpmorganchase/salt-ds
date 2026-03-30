import { FloatingFocusManager } from "@floating-ui/react";
import { makePrefixer, useFloatingUI, useForkRef, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithRef,
  forwardRef,
  type KeyboardEvent,
  type MutableRefObject,
  useEffect,
  useState,
} from "react";
import sidePanelCss from "./SidePanel.css";
import { useSidePanelGroup } from "./SidePanelGroupContext";

const withBaseName = makePrefixer("saltSidePanel");

export interface SidePanelProps extends ComponentPropsWithRef<"div"> {
  /**
   * Edge the panel is anchored to; controls animation direction and divider side.
   * @default "right"
   */
  position?: "right" | "left";
  /**
   * Which element to focus when the panel opens.
   * @default 0
   */
  initialFocus?: number | MutableRefObject<HTMLElement | null>;
  /**
   * Whether the panel is open.
   */
  open?: boolean;
  /**
   * Callback when open state should change
   */
  onOpenChange?: (newOpen: boolean) => void;
  /**
   * Change background color palette
   * @default "primary"
   */
  variant?: "primary" | "secondary" | "tertiary";
  /**
   * Reference to the trigger element for manual mode. Used to return focus when panel closes.
   * When inside SidePanelGroup, this is automatically managed via SidePanelTrigger.
   */
  triggerRef?: MutableRefObject<HTMLElement | null>;
}

export const SidePanel = forwardRef<HTMLDivElement, SidePanelProps>(
  function SidePanel(props, ref) {
    const {
      position = "right",
      initialFocus = 0,
      open: openProp = false,
      onOpenChange: onOpenChangeProp,
      variant = "primary",
      children,
      className,
      id: idProp,
      onKeyDownCapture,
      triggerRef: manualTriggerRef,
      ...rest
    } = props;
    const [showComponent, setShowComponent] = useState(false);
    const targetWindow = useWindow();
    const {
      open: groupOpen,
      setOpen: setGroupOpen,
      panelId,
      triggerRef: groupTriggerRef,
    } = useSidePanelGroup();

    useComponentCssInjection({
      testId: "salt-side-panel",
      css: sidePanelCss,
      window: targetWindow,
    });

    const id = useId(idProp || panelId);

    // Use SidePanelGroup props if available
    const open = groupOpen ?? openProp;
    const onOpenChange = setGroupOpen ?? onOpenChangeProp;
    const focusReturnTriggerRef = groupTriggerRef ?? manualTriggerRef;

    const { context, refs } = useFloatingUI({
      open,
      onOpenChange,
    });
    const { setReference, setFloating } = refs;
    const handleRef = useForkRef<HTMLDivElement>(setFloating, ref);

    useEffect(() => {
      if (focusReturnTriggerRef?.current) {
        setReference(focusReturnTriggerRef.current);
      }
    }, [focusReturnTriggerRef, setReference]);

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

    const handleKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDownCapture?.(event);

      if (event.defaultPrevented || event.key !== "Escape") {
        return;
      }

      event.stopPropagation();
      onOpenChange?.(false);
    };

    if (!showComponent) return null;

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
