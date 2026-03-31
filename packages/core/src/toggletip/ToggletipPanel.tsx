import {
  arrow,
  FloatingArrow,
  flip,
  limitShift,
  offset,
  shift,
} from "@floating-ui/react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
  useRef,
} from "react";
import {
  makePrefixer,
  useFloatingComponent,
  useFloatingUI,
  useForkRef,
} from "../utils";
import { useToggletipContext } from "./ToggletipContext";
import toggletipPanelCss from "./ToggletipPanel.css";

const withBaseName = makePrefixer("saltToggletipPanel");

export interface ToggletipPanelProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The content of Toggletip Panel
   */
  children?: ReactNode;
}

export const ToggletipPanel = forwardRef<HTMLDivElement, ToggletipPanelProps>(
  function ToggletipPanel(props, ref) {
    const {
      className,
      "aria-labelledby": ariaLabelledby,
      children,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-toggletip-panel",
      css: toggletipPanelCss,
      window: targetWindow,
    });

    const { Component: FloatingComponent } = useFloatingComponent();

    const {
      openState,
      floatingRootContext,
      setFloatingContent,
      getFloatingProps,
      setFloating,
      placement,
      triggerId,
    } = useToggletipContext();

    const handleRef = useForkRef<HTMLDivElement>(setFloating, ref);

    const arrowRef = useRef<SVGSVGElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const handleContentRef = useForkRef<HTMLDivElement>(
      contentRef,
      setFloatingContent,
    );
    const { y, x, elements, strategy, context } = useFloatingUI({
      rootContext: floatingRootContext,
      placement,
      middleware: [
        offset(8),
        shift({ limiter: limitShift() }),
        flip({
          fallbackAxisSideDirection: "end",
          fallbackStrategy: "initialPlacement",
        }),
        arrow({
          element: arrowRef,
        }),
      ],
    });
    return (
      <FloatingComponent
        open={openState}
        className={clsx(withBaseName(), className)}
        ref={handleRef}
        width={elements.floating?.offsetWidth}
        height={elements.floating?.offsetHeight}
        top={y ?? 0}
        left={x ?? 0}
        position={strategy}
        focusManagerProps={{
          context,
          modal: false,
          initialFocus: contentRef,
          closeOnFocusOut: true,
          order: ["floating", "content"],
        }}
      >
        <div
          ref={handleContentRef}
          className={withBaseName("content")}
          tabIndex={0}
          {...getFloatingProps({
            "aria-labelledby": clsx(ariaLabelledby, triggerId) || undefined,
            ...rest,
          })}
        >
          {children}
        </div>
        <FloatingArrow
          ref={arrowRef}
          context={context}
          strokeWidth={1}
          fill="var(--toggletip-background)"
          stroke="var(--toggletip-borderColor)"
          height={6}
          width={12}
        />
      </FloatingComponent>
    );
  },
);
