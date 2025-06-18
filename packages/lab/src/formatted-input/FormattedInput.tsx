import { useControlled } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef } from "react";
import { useRifm } from "rifm";
import {
  InputLegacy as Input,
  type InputLegacyProps as InputProps,
} from "../input-legacy";
import formattedInputCss from "./FormattedInput.css";
import {
  baseName,
  InputWithMask,
  type InputWithMaskProps,
} from "./internal/InputWithMask";

export type MaskFunction = (value: string | undefined) => boolean;

export interface RifmOptions {
  format?: (str: string) => string;
  replace?: (str: string) => string;
  append?: (str: string) => string;
  mask?: boolean | MaskFunction;
  accept?: RegExp;
}

export interface FormattedInputProps extends Omit<InputProps, "onChange"> {
  mask?: string;
  onChange?: (value: string) => void;
  rifmOptions?: RifmOptions;
  value?: string;
  defaultValue?: string;
}

const defaultFormatter = (string: string): string => string;
const defaultRifmOptions: RifmOptions = {};

export const FormattedInput = forwardRef<HTMLInputElement, FormattedInputProps>(
  function FormattedInput(
    {
      defaultValue = "",
      className,
      inputProps,
      mask,
      onChange,
      rifmOptions = defaultRifmOptions,
      value: valueProp,
      textAlign,
      ...other
    },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-formatted-input",
      css: formattedInputCss,
      window: targetWindow,
    });

    const [valueState, setValueState] = useControlled<string | undefined>({
      default: defaultValue,
      controlled: valueProp,
      name: "FormattedInput",
      state: "value",
    });

    const handleChange = (value: string) => {
      setValueState(value);
      onChange?.(value);
    };

    let rifmMask = false;

    if (rifmOptions.mask) {
      rifmMask =
        typeof rifmOptions.mask === "function"
          ? rifmOptions.mask(valueState)
          : rifmOptions.mask;
    }

    const rifm = useRifm({
      format: defaultFormatter,
      accept: /.*/,
      ...rifmOptions,
      mask: rifmMask,
      value: valueState || "",
      onChange: handleChange,
    });

    return (
      <Input
        className={clsx(baseName, className)}
        inputComponent={InputWithMask}
        inputProps={{ mask, textAlign, ...inputProps } as InputWithMaskProps}
        onChange={rifm.onChange}
        textAlign={textAlign}
        value={rifm.value}
        {...other}
        ref={ref}
      />
    );
  },
);
