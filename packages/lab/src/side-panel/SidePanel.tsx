import { FloatingFocusManager } from "@floating-ui/react";
import { makePrefixer, useFloatingUI, useForkRef, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentProps,
  type ComponentPropsWithRef,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import sidePanelCss from "./SidePanel.css";
import { useSidePanelContext } from "./SidePanelContext";

const withBaseName = makePrefixer("saltSidePanel");

export interface SidePanelProps extends ComponentPropsWithRef<"div"> {
  /**
   * Disable the panel's own open/close animation.
   * Set to `true` when the parent controls sizing and animation (e.g. inside a splitter).
   * @default false
   */
  disableAnimation?: boolean;
  /**
   * Edge the panel is anchored to; controls animation direction and divider side.
   * @default "right"
   */
  position?: "right" | "left";
  /**
   * Which element receives focus when the panel opens.
   * Pass a number for the tabbable element index (0 = first), or a ref to a specific element.
   * Defaults to the side panel close button.
   */
  initialFocus?: ComponentProps<typeof FloatingFocusManager>["initialFocus"];
  /**
   * The background color palette. Options are 'primary', 'secondary', 'tertiary' and 'none'.
   * @default "primary"
   */
  variant?: "primary" | "secondary" | "tertiary" | "none";
}

export const SidePanel = forwardRef<HTMLDivElement, SidePanelProps>(
  function SidePanel(props, ref) {
    const {
      disableAnimation = false,
      position = "right",
      initialFocus,
      variant = "primary",
      children,
      id: idProp,
      className,
      "aria-labelledby": ariaLabelledBy,
      ...rest
    } = props;

    const {
      openState,
      floatingRootContext,
      setFloating,
      getFloatingProps,
      setPanelId,
      headerId,
    } = useSidePanelContext();

    const id = useId(idProp);

    const [showComponent, setShowComponent] = useState(openState);
    const [animating, setAnimating] = useState(false);
    // On first mount while open, skip moving focus when focus did not come from the trigger.
    const [skipInitialFocus, setSkipInitialFocus] = useState(() => {
      if (!openState) return false;
      const reference = floatingRootContext.elements.reference;
      if (!(reference instanceof Element)) return true;
      const activeElement = reference.ownerDocument?.activeElement;
      return !activeElement || !reference.contains(activeElement);
    });
    // Track whether this is the initial render to skip the open animation.
    const initialRender = useRef(true);
    const targetWindow = useWindow();

    useComponentCssInjection({
      testId: "salt-side-panel",
      css: sidePanelCss,
      window: targetWindow,
    });

    const { context } = useFloatingUI({
      rootContext: floatingRootContext,
    });

    const handleRef = useForkRef<HTMLDivElement>(setFloating, ref);

    const handleAnimationEnd = () => {
      setAnimating(false);
      if (!openState) {
        setShowComponent(false);
      }
    };

    useEffect(() => {
      // Keep this as state (not ref): setPanelId causes a context re-render and
      // this value is consumed as a prop for initial focus behavior.
      setPanelId(id);

      return () => {
        setPanelId(undefined);
      };
    }, [id, setPanelId]);

    useEffect(() => {
      if (!openState) {
        setSkipInitialFocus(false);
      }
    }, [openState]);

    useEffect(() => {
      if (disableAnimation) {
        // When animation is disabled the panel is always kept mounted so the parent can
        // control sizing (e.g. flex-grow transition in a splitter).
        setShowComponent(true);
        setAnimating(false);
        initialRender.current = false;
        return;
      }

      // Skip animation on initial render when panel is already open
      if (initialRender.current && openState) {
        setShowComponent(true);
        setAnimating(false);
        initialRender.current = false;
        return;
      }

      const prefersReducedMotion = targetWindow?.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      )?.matches;

      if (openState) {
        setShowComponent(true);
      }

      if (prefersReducedMotion) {
        setAnimating(false);
        if (!openState) {
          setShowComponent(false);
        }
      } else {
        setAnimating(true);
      }

      initialRender.current = false;
    }, [openState, targetWindow, disableAnimation]);

    if (!showComponent) return null;

    // `-1` skips initial focus movement but preserves focus guards/return focus handling.
    const resolvedInitialFocus = skipInitialFocus ? -1 : (initialFocus ?? 0);

    const panelDiv = (
      <div
        role="region"
        aria-labelledby={clsx(ariaLabelledBy, headerId) || undefined}
        ref={handleRef}
        className={clsx(
          withBaseName(),
          {
            [withBaseName(position)]: position,
            [withBaseName(variant)]: variant,
            [withBaseName("enterAnimation")]:
              !disableAnimation && openState && animating,
            [withBaseName("exitAnimation")]:
              !disableAnimation && !openState && animating,
          },
          className,
        )}
        onAnimationEnd={disableAnimation ? undefined : handleAnimationEnd}
        {...getFloatingProps({
          ...rest,
          id,
        })}
      >
        <div className={withBaseName("inner")}>{children}</div>
      </div>
    );

    if (openState) {
      return (
        <FloatingFocusManager
          context={context}
          modal={false}
          initialFocus={resolvedInitialFocus}
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
