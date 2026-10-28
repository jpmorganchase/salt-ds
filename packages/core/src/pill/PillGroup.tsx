import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type SyntheticEvent,
  useCallback,
  useMemo,
} from "react";
import { useFormFieldProps } from "../form-field-context";
import { makePrefixer, useControlled } from "../utils";
import pillGroupCss from "./PillGroup.css";
import { PillGroupContext } from "./PillGroupContext";

interface CommonPillGroupProps extends ComponentPropsWithoutRef<"fieldset"> {
  /**
   * If `true`, the Pill group will be disabled.
   */
  disabled?: boolean;

  /**
   * Selection variant of the Pill group. If "none", the Pills will not be selectable. If "multiple", pills inside behave like checkboxes.
   */
  selectionVariant?: "none" | "multiple";
}

interface SelectablePillGroupProps extends CommonPillGroupProps {
  selectionVariant: "multiple";
  /**
   * The currently selected values.
   */
  selected?: string[];
  /**
   * The default selected values for un-controlled component.
   */
  defaultSelected?: string[];
  /**
   * Callback fired when the selection changes.
   * @param event
   * @param newSelected The new selected values.
   */
  onSelectionChange?: (event: SyntheticEvent, newSelected: string[]) => void;
}

interface NonSelectablePillGroupProps extends CommonPillGroupProps {
  selectionVariant?: "none";
}

export type PillGroupProps =
  | SelectablePillGroupProps
  | NonSelectablePillGroupProps;

const withBaseName = makePrefixer("saltPillGroup");

export const PillGroup = forwardRef<HTMLFieldSetElement, PillGroupProps>(
  function PillGroup(props, ref) {
    const {
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      disabled: disabledProp,
      children,
      selected: selectedProp,
      defaultSelected,
      onSelectionChange,
      className,
      selectionVariant = "none",
      ...rest
    } = props as SelectablePillGroupProps;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-pill-group",
      css: pillGroupCss,
      window: targetWindow,
    });

    const { a11yProps: formFieldA11yProps, disabled: formFieldDisabled } =
      useFormFieldProps();

    const disabled = formFieldDisabled || disabledProp;

    const [selected, setSelected] = useControlled({
      controlled: selectedProp,
      default: defaultSelected || [],
      name: "PillGroup",
      state: "selected",
    });

    const select = useCallback(
      (event: SyntheticEvent, newValue: string) => {
        if (disabled) {
          return;
        }

        const newSelected = selected.includes(newValue)
          ? selected.filter((item) => item !== newValue)
          : selected.concat(newValue);

        setSelected(newSelected);
        onSelectionChange?.(event, newSelected);
      },
      [disabled, selected, onSelectionChange],
    );

    const context = useMemo(
      () =>
        ({
          disabled,
          select,
          selected,
          selectionVariant,
        }) as const,
      [disabled, select, selected, selectionVariant],
    );

    return (
      <PillGroupContext.Provider value={context}>
        <fieldset
          aria-labelledby={
            clsx(formFieldA11yProps?.["aria-labelledby"], ariaLabelledBy) ||
            undefined
          }
          aria-describedby={
            clsx(formFieldA11yProps?.["aria-describedby"], ariaDescribedBy) ||
            undefined
          }
          className={clsx(withBaseName(), className)}
          ref={ref}
          {...rest}
        >
          {children}
        </fieldset>
      </PillGroupContext.Provider>
    );
  },
);
