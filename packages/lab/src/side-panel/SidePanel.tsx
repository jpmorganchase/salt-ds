import {
  makePrefixer,
  useEventCallback,
  useForkRef,
  useId,
  useIsomorphicLayoutEffect,
  usePrevious,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type AnimationEvent,
  type ComponentPropsWithRef,
  forwardRef,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { tabbable } from "tabbable";
import { SidePanelContext, useSidePanelContext } from "./internal";
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
   * Defaults to the first tabbable element inside the panel (close button if present).
   */
  initialFocus?: number | RefObject<HTMLElement | null>;
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
      onAnimationEnd,
      ...rest
    } = props;

    const sidePanelContext = useSidePanelContext();
    const { openState, setFloating, setPanelId, titleId } = sidePanelContext;
    const positionedContext = useMemo(
      () => ({ ...sidePanelContext, position }),
      [sidePanelContext, position],
    );

    const id = useId(idProp);

    const [showComponent, setShowComponent] = useState(openState);
    const [animating, setAnimating] = useState(false);
    const shouldAnimateOpen = useRef(!openState);
    // Stays true until a ref-callback invocation observes focus already
    // inside the trigger (a user-driven open). Flipping this from a mount
    // effect would break under React 18 strict-mode double-mounting.
    const initialMountRef = useRef(true);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const targetWindow = useWindow();

    useComponentCssInjection({
      testId: "salt-side-panel",
      css: sidePanelCss,
      window: targetWindow,
    });

    // Guards against re-focusing the panel multiple times per open session.
    const initialFocusDoneRef = useRef(false);
    useEffect(() => {
      if (!openState) {
        initialFocusDoneRef.current = false;
      }
    }, [openState]);

    // useEventCallback keeps a stable identity while always reading the
    // latest closure, so React doesn't tear down and re-invoke the ref
    // callback per render.
    const handleInitialFocus = useEventCallback((el: HTMLDivElement | null) => {
      if (!el || !openState || initialFocusDoneRef.current) {
        return;
      }

      // On first mount, only auto-focus if focus is already in the trigger
      // (the common click path). For defaultOpen without user interaction
      // we leave focus alone.
      if (initialMountRef.current) {
        const reference =
          sidePanelContext.floatingRootContext.elements.reference;
        const activeElement =
          reference instanceof Element
            ? reference.ownerDocument?.activeElement
            : null;
        const focusCameFromTrigger =
          reference instanceof Element &&
          activeElement instanceof Node &&
          reference.contains(activeElement);
        if (!focusCameFromTrigger) {
          return;
        }
        initialMountRef.current = false;
      }

      initialFocusDoneRef.current = true;
      // Defer one frame so useSidePanelTabOrder has marked descendants
      // with data-salt-original-tabindex and any child layout effects
      // (e.g. SidePanelContent's scrollable-body tabIndex toggle) have
      // settled. Scoped to the panel's owner window for iframe/shadow-root
      // hosts.
      const raf =
        el.ownerDocument.defaultView?.requestAnimationFrame ??
        targetWindow?.requestAnimationFrame ??
        requestAnimationFrame;
      raf(() => {
        if (!el.isConnected) return;
        const focusTarget = resolveInitialFocusTarget(el, initialFocus);
        focusTarget?.focus();
      });
    });

    const setPanelEl = useEventCallback((el: HTMLDivElement | null) => {
      panelRef.current = el;
      setFloating(el);
      handleInitialFocus(el);
    });

    const handleRef = useForkRef<HTMLDivElement>(setPanelEl, ref);

    const handleAnimationEnd = useEventCallback(
      (event: AnimationEvent<HTMLDivElement>) => {
        onAnimationEnd?.(event);

        if (event.currentTarget !== event.target || disableAnimation) return;
        setAnimating(false);
        if (!openState) {
          setShowComponent(false);
        }
      },
    );

    useEffect(() => {
      setPanelId(id);
      return () => {
        setPanelId(undefined);
      };
    }, [id, setPanelId]);

    // Return focus to the trigger on close (mirrors floating-ui's
    // returnFocus). Initial previousOpenState of `false` ensures we never
    // restore on mount — only on a real true→false transition.
    const reference = sidePanelContext.floatingRootContext.elements.reference;
    const previousOpenState = usePrevious(openState, [openState], false);
    useEffect(() => {
      if (!previousOpenState || openState) return;
      const panel = panelRef.current;
      if (!(reference instanceof HTMLElement)) return;
      const doc = reference.ownerDocument;
      const active = doc?.activeElement;
      const focusInsidePanel =
        panel && active instanceof Node && panel.contains(active);
      const focusOnBody = active === doc?.body || active == null;
      if (focusInsidePanel || focusOnBody) {
        reference.focus();
      }
    }, [openState, previousOpenState, reference]);

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

      // Skip enter animation when the panel was open from the start.
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
    }, [openState, targetWindow, disableAnimation]);

    if (!showComponent) return null;

    return (
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
        onAnimationEnd={handleAnimationEnd}
        tabIndex={-1}
        {...rest}
        id={id}
      >
        <SidePanelContext.Provider value={positionedContext}>
          <div className={withBaseName("inner")}>{children}</div>
        </SidePanelContext.Provider>
      </div>
    );
  },
);

function resolveInitialFocusTarget(
  panel: HTMLElement,
  initialFocus: SidePanelProps["initialFocus"],
): HTMLElement | null {
  if (initialFocus && typeof initialFocus === "object") {
    return initialFocus.current ?? null;
  }

  // Prefer the panel's "managed" sequence (elements detached from the
  // natural tab order by useSidePanelTabOrder), falling back to a fresh
  // tabbable() scan when detachment hasn't run yet.
  const managed = Array.from(
    panel.querySelectorAll<HTMLElement>("[data-salt-original-tabindex]"),
  );

  const candidates = managed.length
    ? managed
    : (tabbable(panel, { displayCheck: "none" }) as HTMLElement[]);

  const index = typeof initialFocus === "number" ? initialFocus : 0;
  return candidates[index] ?? candidates[0] ?? panel;
}
