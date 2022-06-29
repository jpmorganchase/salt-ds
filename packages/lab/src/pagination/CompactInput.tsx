import { FormField, FormFieldProps } from "@jpmorganchase/uitk-core";
import cn from "classnames";
import {
  ChangeEventHandler,
  FC,
  KeyboardEventHandler,
  useEffect,
  useState,
} from "react";
import { Input } from "../input";
import { withBaseName } from "./utils";

export interface CompactInputProps {
  count: number;
  page: number;
  onPageChange: (page: number) => void;
  FormFieldProps?: Partial<FormFieldProps>;
}

export const CompactInput: FC<CompactInputProps> = ({
  page,
  count,
  onPageChange,
  FormFieldProps: { className, ...restFormFieldProps } = {},
}) => {
  const [inputValue, setInputValue] = useState(`${page}`);

  useEffect(() => {
    setInputValue(`${page}`);
  }, [page]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setInputValue(event.target.value);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
      const pageValue = Number(inputValue);
      if (!isNaN(pageValue) && pageValue <= count && pageValue > 0) {
        onPageChange(pageValue);
      } else {
        setInputValue(`${page}`);
      }
    }
  };

  const handleBlur = () => {
    setInputValue(`${page}`);
  };

  return (
    <span>
      <FormField
        className={cn(withBaseName("compactInputField"), className)}
        fullWidth={false}
        {...restFormFieldProps}
      >
        <Input
          className={cn(withBaseName("compactInput"), {
            [withBaseName("compactInputFixed")]: count < 100,
          })}
          highlightOnFocus
          inputProps={{
            "aria-label": `Go to page, ${count} total`,
            style: { width: `${`${count}`.length}ch` },
            role: "textbox",
          }}
          onBlur={handleBlur}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          value={inputValue}
          textAlign={"center"}
        />
      </FormField>
    </span>
  );
};
