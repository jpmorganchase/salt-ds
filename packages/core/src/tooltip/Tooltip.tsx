import {clsx} from "clsx";
import {forwardRef, HTMLAttributes, ReactNode,} from "react";
import {FloatingPortal} from "@floating-ui/react";
import {useWindow} from "@salt-ds/window";
import {useComponentCssInjection} from "@salt-ds/styles";

import {makePrefixer, UseFloatingUIProps, useForkRef,} from "../utils";
import {SaltProvider} from "../salt-provider";

import {useTooltip, UseTooltipProps} from "./useTooltip";
import tooltipCss from "./Tooltip.css";
import {Input} from "../input";
import {ListNext} from "@salt-ds/lab";

const withBaseName = makePrefixer("saltTooltip");

export interface TooltipProps
  extends Pick<UseFloatingUIProps, "open" | "onOpenChange" | "placement">,
    HTMLAttributes<HTMLDivElement> {
  /**
   * The children will be the Tooltip's trigger.
   */
  children: ReactNode;
  /**
   * Option to not display the Tooltip. Can be used in conditional situations like text truncation.
   */
  disabled?: boolean;
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const {
      children,
      className,
      disabled,
      open: openProp,
      placement = "bottom",
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tooltip",
      css: tooltipCss,
      window: targetWindow,
    });

    const hookProps: UseTooltipProps = {
      open: openProp,
      placement,
      ...rest,
    };

    const {
      open,
      floating,
      reference,
      getTriggerProps,
      getTooltipProps,
    } = useTooltip(hookProps);

    const triggerRef = useForkRef(ref, reference);

    const floatingRef = floating;

    return (
      <>
        <Input
          // onFocus={handleFocus}
          disabled={disabled}
          // onBlur={handleBlur}
          // TODO: split this into change and keydown
          //      onChange={handleKeyDown}
          //      onKeyDown={handleKeyDown}
          //      value={value}
          //      aria-controls={listId}
          aria-expanded={open}
          aria-haspopup="listbox"
          // aria-labelledby={comboBoxAriaLabel}
          // id={comboBoxId}
          role="combobox"
          tabIndex={disabled ? -1 : 0}
          {...getTriggerProps()}
          ref={triggerRef}
        />
        <FloatingPortal>
          {/* The provider is needed to support the use case where an app has nested modes. The element that is portalled needs to have the same style as the current scope */}
          {open && !disabled && (
          <SaltProvider>
                  <ListNext
                    // id={listId}
                    // ref={floatingRef}
                    // {...getTooltipProps()}
                    // style={floatingStyles}
                    disabled={disabled}
                    ref={floatingRef}
                    {...getTooltipProps()}
                    // role="listbox" aria-labelledby={comboBoxAriaLabel}
                    tabIndex={-1}>
                    {children}
                  </ListNext>
            </SaltProvider>
        )}
        </FloatingPortal>

      </>
    );
  }
);
