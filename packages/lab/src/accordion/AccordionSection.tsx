import {
  forwardRef,
  HTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { makePrefixer } from "@salt-ds/core";
import { useLayoutEffectSkipFirst } from "../utils";
import { AccordionSectionContext } from "./AccordionSectionContext";
import { clsx } from "clsx";
import { useAccordionContext } from "./AccordionContext";
import { isNotProduction } from "./utils";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import accordionCss from "./Accordion.css";

const withBaseName = makePrefixer("saltAccordionSection");

export interface AccordionSectionProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  defaultExpanded?: boolean;
  disabled?: boolean;
  expanded?: boolean;
  onChange?: (isExpanded: boolean) => void;
  className?: string;
}

export const AccordionSection = forwardRef<
  HTMLDivElement,
  AccordionSectionProps
>(function Accordion(
  {
    id: idProp,
    disabled: disabledProp,
    onChange: onChangeProp,
    defaultExpanded: defaultExpandedProp,
    expanded: expandedProp,
    children,
    className,
    ...restProps
  },
  ref
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-accordion",
    css: accordionCss,
    window: targetWindow,
  });

  const [id, setId] = useState(() =>
    idProp != null ? idProp : `salt-${Math.round(Math.random() * 1e5)}`
  );

  if (idProp != null && idProp != id) {
    setId(idProp);
  }

  const {
    registerSection,
    unregisterSection,
    onChange,
    isExpanded,
    disabled: accordionDisabled,
  } = useAccordionContext();

  const isControlled = expandedProp != null;
  const expanded = isControlled ? expandedProp : isExpanded(id);
  const disabled = disabledProp != null ? disabledProp : accordionDisabled;

  useEffect(() => {
    registerSection(
      id,
      expandedProp != null ? expandedProp : !!defaultExpandedProp
    );
    return () => {
      unregisterSection(id);
    };
  }, [id, registerSection, unregisterSection]);

  const onToggle = useCallback(() => {
    const newExpanded = !expanded;
    if (onChangeProp) {
      onChangeProp(newExpanded);
    }
    if (!isControlled) {
      onChange(id, newExpanded);
    }
  }, [id, expanded, onChangeProp, onChange, isControlled]);

  useEffect(() => {
    const isControlled = expandedProp != null;
    if (isControlled) {
      onChange(id, expandedProp);
    }
  }, [expandedProp, isControlled]);

  useLayoutEffectSkipFirst(() => {
    if (isNotProduction()) {
      const mode = (isControlled: boolean) =>
        isControlled ? "controlled" : "uncontrolled";
      console.error(
        `A component is changing from ${mode(!isControlled)} to ${mode(
          isControlled
        )} mode.`
      );
    }
  }, [isControlled]);

  const contextValue: AccordionSectionContext = useMemo(() => {
    return {
      isExpanded: expanded,
      isDisabled: disabled,
      onToggle,
    };
  }, [expanded, disabled, onToggle]);

  return (
    <div
      {...restProps}
      className={clsx(
        withBaseName(),
        {
          [withBaseName("expanded")]: expanded,
          [withBaseName("disabled")]: disabled,
        },
        className
      )}
      ref={ref}
    >
      <AccordionSectionContext.Provider value={contextValue}>
        {children}
      </AccordionSectionContext.Provider>
    </div>
  );
});
