import { ComponentPropsWithoutRef, forwardRef, SyntheticEvent } from "react";
import { makePrefixer, useControlled, useId } from "@salt-ds/core";
import { clsx } from "clsx";
import { AccordionContext } from "./AccordionContext";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import accordionCss from "./Accordion.css";
export interface AccordionProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * AccordionGroup value.
   */
  value: string;
  /**
   * Whether the accordion is expanded.
   */
  expanded?: boolean;
  /**
   * Whether the accordion is expanded by default.
   */
  defaultExpanded?: boolean;
  /**
   * Callback fired when the accordion is toggled.
   * @param event
   */
  onToggle?: (event: SyntheticEvent<HTMLButtonElement>) => void;
  /**
   * Whether the accordion is disabled.
   */
  disabled?: boolean;
}

const withBaseName = makePrefixer("saltAccordion");

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  function Accordion(props, ref) {
    const {
      className,
      defaultExpanded,
      expanded: expandedProp,
      disabled,
      id: idProp,
      onToggle,
      value,
      ...rest
    } = props;

    const id = useId(idProp);
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-accordion",
      css: accordionCss,
      window: targetWindow,
    });

    const [expanded, setExpanded] = useControlled({
      controlled: expandedProp,
      default: Boolean(defaultExpanded),
      name: "Accordion",
      state: "expanded",
    });

    const toggle = (event: SyntheticEvent<HTMLButtonElement>) => {
      setExpanded((prev) => !prev);
      onToggle?.(event);
    };

    return (
      <AccordionContext.Provider
        value={{
          value,
          toggle,
          expanded,
          disabled: Boolean(disabled),
          id: id ?? "",
        }}
      >
        <div ref={ref} className={clsx(withBaseName(), className)} {...rest} />
      </AccordionContext.Provider>
    );
  }
);
