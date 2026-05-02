import { FloatingFocusManager } from "@floating-ui/react";
import {
  makePrefixer,
  useFloatingUI,
  useForkRef,
  useId,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type AnimationEvent,
  type ComponentProps,
  type ComponentPropsWithRef,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSidePanelContext } from "./internal";
import sidePanelCss from "./SidePanel.css";

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

    const { openState, floatingRootContext, setFloating, setPanelId, titleId } =
      useSidePanelContext();

    const id = useId(idProp);

    const [showComponent, setShowComponent] = useState(openState);
    const [animating, setAnimating] = useState(false);
    const shouldAnimateOpen = useRef(!openState);
    // On first mount while open, skip moving focus when focus did not come from the trigger.
    const [skipInitialFocus, setSkipInitialFocus] = useState(() => {
      if (!openState) return false;
      const reference = floatingRootContext.elements.reference;
      if (!(reference instanceof Element)) return true;
      const activeElement = reference.ownerDocument?.activeElement;
      return !activeElement || !reference.contains(activeElement);
    });
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

    const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
      if (event.currentTarget !== event.target) return;
      setAnimating(false);
      if (!openState) {
        setShowComponent(false);
      }
    };

    useEffect(() => {
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

    useIsomorphicLayoutEffect(() => {
      if (disableAnimation) {
        setShowComponent(openState);
        setAnimating(false);
        if (!openState) shouldAnimateOpen.current = true;
        return;
      }

      if (!openState) {
        shouldAnimateOpen.current = true;
      }

      // Don't animate if the panel has never been closed (defaultOpen scenario).
      if (openState && !shouldAnimateOpen.current) {
        setShowComponent(true);
        setAnimating(false);
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
      // biome-ignore lint/correctness/useExhaustiveDependencies: Excluding floatingRootContext.elements.reference is safe because when the trigger changes while the panel is already open (e.g. table row switching), openState remains true so no visual update is needed.
    }, [openState, targetWindow, disableAnimation]);

    if (!showComponent) return null;

    const resolvedInitialFocus = skipInitialFocus ? -1 : (initialFocus ?? 0);

    const panelDiv = (
      <div
        role="region"
        aria-labelledby={clsx(ariaLabelledBy, titleId) || undefined}
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
        {...rest}
        id={id}
      >
        <div className={withBaseName("inner")}>{children}</div>
      </div>
    );

    if (openState || animating) {
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
