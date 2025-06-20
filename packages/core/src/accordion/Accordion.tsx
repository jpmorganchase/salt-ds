import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type SyntheticEvent,
  useState,
} from "react";
import { makePrefixer, useControlled, useId } from "../utils";
import accordionCss from "./Accordion.css";
import { AccordionContext } from "./AccordionContext";
export interface AccordionProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onToggle"> {
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
   * Side to align the Accordion's indicator. Defaults to `left`.
   */
  indicatorSide?: "left" | "right";
  /**
   * Callback fired when the accordion is toggled.
   */
  onToggle?: (event: SyntheticEvent<HTMLButtonElement>) => void;
  /**
   * Whether the accordion is disabled.
   */
  disabled?: boolean;
  /**
   * The status of the accordion.
   */
  status?: "error" | "warning" | "success";
}

const withBaseName = makePrefixer("saltAccordion");

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  function Accordion(props, ref) {
    const {
      className,
      defaultExpanded,
      expanded: expandedProp,
      disabled,
      indicatorSide = "left",
      id: idProp,
      onToggle,
      status,
      value,
      ...rest
    } = props;

    const id = useId(idProp);
    const [headerId, setHeaderId] = useState(`${id}-header`);
    const [panelId, setPanelId] = useState(`${id}-panel`);

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
          indicatorSide,
          disabled: Boolean(disabled),
          headerId,
          setHeaderId,
          panelId,
          setPanelId,
          status,
        }}
      >
        <div
          ref={ref}
          className={clsx(
            withBaseName(),
            {
              [withBaseName(status ?? "")]: status,
              [withBaseName("disabled")]: disabled,
            },
            className,
          )}
          {...rest}
        />
      </AccordionContext.Provider>
    );
  },
);
