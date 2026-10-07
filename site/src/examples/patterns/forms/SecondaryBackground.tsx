import {
  Dropdown,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  GridItem,
  GridLayout,
  Input,
  Label,
  MultilineInput,
  Option,
} from "@salt-ds/core";
import { type ChangeEvent, useState } from "react";

export const SecondaryBackground = () => {
  const [value, setValue] = useState<string>("Value text");
  const [isError, setIsError] = useState<boolean>(false);
  const MAX_CHARS = 1000;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newVal = event.target.value;
    setValue(newVal);
    setIsError(newVal.length > MAX_CHARS);
  };

  return (
    <GridLayout
      columns={4}
      style={{
        padding: "var(--salt-spacing-300)",
        backgroundColor: "var(--salt-container-secondary-background)",
        width: "calc(var(--salt-size-base) * 12)",
      }}
    >
      <GridItem colSpan={4}>
        <FormField>
          <FormFieldLabel>Field label</FormFieldLabel>
          <Input defaultValue="Value text" />
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </FormField>
      </GridItem>
      <GridItem colSpan={4}>
        <FormField>
          <FormFieldLabel>Field label</FormFieldLabel>
          <Dropdown defaultSelected={["Value text"]}>
            <Option value="Value text">Value text</Option>
          </Dropdown>
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </FormField>
      </GridItem>
      <GridItem colSpan={4}>
        <FormField>
          <FormFieldLabel>Field label</FormFieldLabel>
          <MultilineInput
            bordered
            endAdornment={
              <Label variant={!isError ? "secondary" : "primary"}>
                {!isError && `${value.length}/${MAX_CHARS}`}
                {isError && <strong>{`${value.length}/${MAX_CHARS}`}</strong>}
              </Label>
            }
            onChange={handleChange}
            value={value}
            validationStatus={isError ? "error" : undefined}
          />
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </FormField>
      </GridItem>
    </GridLayout>
  );
};
