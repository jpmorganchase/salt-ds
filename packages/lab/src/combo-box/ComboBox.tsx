import { ComponentType, forwardRef, Ref, useRef } from "react";

import { makePrefixer, useForkRef } from "@jpmorganchase/uitk-core";
import classnames from "classnames";
import warning from "warning";

import { useFormFieldProps } from "../form-field-context";
import { useWidth } from "../list/internal/useWidth";
import { useId } from "../utils";
import {
  DefaultComboBox,
  DefaultComboBoxProps,
} from "./internal/DefaultComboBox";
import {
  MultiSelectComboBox,
  MultiSelectComboBoxProps,
} from "./internal/MultiSelectComboBox";

import "./ComboBox.css";

const withBaseName = makePrefixer("uitkComboBox");

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
    warning(
      isMultiSelect || (!isMultiSelect && !delimiter),
      "Delimiter can only be used for a multi-select combo-box."
    );
  }
};

export type ComboBoxProps = Omit<
  DefaultComboBoxProps<any> | MultiSelectComboBoxProps<any>,
  "rootRef"
> & {
  rootRef?: Ref<HTMLElement>;
  delimiter?: string | string[];
};

export const ComboBox = forwardRef<HTMLDivElement, ComboBoxProps>(
  function ComboBox(props, ref) {
    const {
      inFormField,
      a11yProps: {
        "aria-labelledby": ariaLabelledBy,
        "aria-required": ariaRequired,
        disabled: formFieldDisabled,
      } = {},
    } = useFormFieldProps();

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
      width == null && listWidth == null
    );

    const ComboBoxComponent = (
      isMultiSelect ? MultiSelectComboBox : DefaultComboBox
    ) as ComponentType<ComboBoxProps>;

    return (
      <div
        className={classnames(
          withBaseName(),
          {
            [withBaseName("disabled")]: disabled,
            [withBaseName(`field`)]: inFormField,
          },
          className
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
            "aria-label": classnames(ariaLabel),
            "aria-labelledby": ariaLabelledBy,
            "aria-required": ariaRequired,
          }}
        />
      </div>
    );
  }
);
