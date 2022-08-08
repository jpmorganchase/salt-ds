import { useId } from "@jpmorganchase/uitk-core";
import cx from "classnames";
import { forwardRef, InputHTMLAttributes } from "react";
import { FormattedInputProps } from "../FormattedInput";

export const baseName = "uitkFormattedInput";

function getClippedMask(
  mask: FormattedInputProps["mask"],
  value: FormattedInputProps["value"],
  textAlign: FormattedInputProps["textAlign"]
) {
  if (mask) {
    if (textAlign === "right") {
      return mask.substring(
        0,
        value ? mask.length - value.length : mask.length
      );
    }

    return mask.substring(value ? value.length : 0);
  }
  return "";
}

export interface InputWithMaskProps
  extends InputHTMLAttributes<HTMLInputElement> {
  mask?: FormattedInputProps["mask"];
  textAlign?: FormattedInputProps["textAlign"];
  value?: FormattedInputProps["value"];
}

export const InputWithMask = forwardRef<HTMLInputElement, InputWithMaskProps>(
  function InputWithMask(
    {
      "aria-labelledby": ariaLabelledBy,
      className,
      mask = "",
      value,
      id: idProp,
      style,
      textAlign,
      ...other
    },
    ref
  ) {
    const id = useId(idProp);

    const spacerAndMask = [
      <i key={value}>{value}</i>,
      getClippedMask(mask, value, textAlign),
    ];

    return (
      <div className={`${baseName}-inputWrapper`}>
        <input
          className={className}
          {...other}
          aria-label={mask}
          aria-labelledby={[ariaLabelledBy, id]
            .filter((label) => label != null)
            .join(" ")}
          id={id}
          ref={ref}
          style={style}
          value={value}
        />
        <span
          aria-hidden="true"
          className={cx(`${baseName}-mask`, className)}
          style={style}
        >
          {textAlign !== "right" ? spacerAndMask : spacerAndMask.reverse()}
        </span>
      </div>
    );
  }
);
