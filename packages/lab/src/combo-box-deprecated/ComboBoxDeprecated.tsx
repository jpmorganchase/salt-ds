import { makePrefixer, useForkRef, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentType, forwardRef, type Ref, useRef } from "react";
import { useFormFieldLegacyProps } from "../form-field-context-legacy";
import { useWidth } from "../list-deprecated/internal/useWidth";
import comboBoxCss from "./ComboBox.css";
import {
  DefaultComboBox,
  type DefaultComboBoxProps,
} from "./internal/DefaultComboBox";
import {
  MultiSelectComboBox,
  type MultiSelectComboBoxProps,
} from "./internal/MultiSelectComboBox";

const withBaseName = makePrefixer("saltComboBox");

function getMultiSelect<Item>({
  multiSelect,
  initialSelectedItem,
  selectedItem,
}: {
  multiSelect?: boolean;
  initialSelectedItem?: Item | Item[];
  selectedItem?: Item | Item[];
}) {
  return (
    multiSelect ||
    Array.isArray(initialSelectedItem) ||
    Array.isArray(selectedItem)
  );
}

const validateProps = ({
  isMultiSelect,
  delimiter,
}: {
  isMultiSelect: boolean;
  delimiter?: string | string[];
}) => {
  if (process.env.NODE_ENV !== "production") {
    if (!isMultiSelect && delimiter) {
      console.warn("Delimiter can only be used for a multi-select combo-box.");
    }
  }
};

export type ComboBoxDeprecatedProps = Omit<
  DefaultComboBoxProps<any> | MultiSelectComboBoxProps<any>,
  "rootRef"
> & {
  rootRef?: Ref<HTMLElement>;
  delimiter?: string | string[];
};

export const ComboBoxDeprecated = forwardRef<
  HTMLDivElement,
  ComboBoxDeprecatedProps
>(function ComboBox(props, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-combo-box-deprecated",
    css: comboBoxCss,
    window: targetWindow,
  });

  const {
    inFormField,
    a11yProps: {
      "aria-labelledby": ariaLabelledBy,
      "aria-required": ariaRequired,
      disabled: formFieldDisabled,
    } = {},
  } = useFormFieldLegacyProps();

  const { current: isMultiSelect } = useRef(getMultiSelect(props));
  validateProps({ isMultiSelect, ...props });

  const {
    inputRef,
    listRef,
    className,
    disabled = formFieldDisabled,
    source = [],
    multiSelect,
    initialSelectedItem,
    selectedItem,
    width,
    listWidth,
    id: idProp,
    "aria-label": ariaLabel,
    ...restProps
  } = props;

  const id = useId(idProp);
  const [rootRef, rootWidth] = useWidth<HTMLDivElement>(
    width == null && listWidth == null,
  );

  const ComboBoxComponent = (
    isMultiSelect ? MultiSelectComboBox : DefaultComboBox
  ) as ComponentType<ComboBoxDeprecatedProps>;

  return (
    <div
      className={clsx(
        withBaseName(),
        {
          [withBaseName("disabled")]: disabled,
          [withBaseName("field")]: inFormField,
        },
        className,
      )}
      id={id}
      ref={useForkRef(ref, rootRef)}
      style={{ width }}
    >
      <ComboBoxComponent
        {...{
          ...restProps,
          id,
          source,
          disabled,
          rootRef,
          rootWidth,
          inputRef,
          listRef,
          listWidth,
          initialSelectedItem,
          selectedItem,
          "aria-label": clsx(ariaLabel),
          "aria-labelledby": ariaLabelledBy,
          "aria-required": ariaRequired,
        }}
      />
    </div>
  );
});
