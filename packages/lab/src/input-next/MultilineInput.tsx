import { clsx } from "clsx";
import {
  forwardRef
} from "react";
import { makePrefixer } from "@salt-ds/core";
import { Input, InputProps } from "./InputNext";

import "./MultilineInput.css";

const withBaseName = makePrefixer("saltMultilineInput");

// TODO: Double confirm whether this should be extending DivElement given root is `<div>`.
// And forwarded ref is not assigned to the root like other components.
export interface MultilineInputProps extends InputProps {
    /**
     * Styling variant with full border. Defaults to false
     */
    fullBorder?: boolean;
    /**
     * Number of rows. Defaults to 4
     */
    rows?: number;
}

export const MultilineInput = forwardRef<HTMLInputElement, MultilineInputProps>(function MultilineInput(
  {
    className: classNameProp,
    fullBorder = false,
    rows = 4,
    ...restProps
  },
  ref
) {
  return (
    <Input 
        className={clsx(withBaseName(), { [withBaseName("fullBorder")]: fullBorder }, classNameProp)} 
        InputComponent="textarea" 
        inputProps={{rows: rows}}
        {...restProps}
    />
  );
});
