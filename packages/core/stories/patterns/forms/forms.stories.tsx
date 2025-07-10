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
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  Text,
} from "@salt-ds/core";
import type { Meta } from "@storybook/react-vite";
import { type ChangeEvent, useState } from "react";

export default {
  title: "Patterns/Forms",
} as Meta;

export const StandardLayout = () => {
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
      style={{ width: "calc(var(--salt-size-base) * 12)" }}
    >
      <GridItem colSpan={4}>
        <FormField>
          <FormFieldLabel>Field label</FormFieldLabel>
          <Input defaultValue="Value text" />
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </FormField>
      </GridItem>
      <GridItem colSpan={2}>
        <FormField>
          <FormFieldLabel>Field label</FormFieldLabel>
          <Dropdown defaultSelected={["Value text"]}>
            <Option value="Value text">Value text</Option>
          </Dropdown>
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </FormField>
      </GridItem>
      <GridItem colSpan={3}>
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

export const Sections = () => {
  return (
    <GridLayout
      columns={4}
      style={{ width: "calc(var(--salt-size-base) * 20)" }}
    >
      <GridItem colSpan={2}>
        <FormField>
          <FormFieldLabel>Expected total annual volumes</FormFieldLabel>
          <Input placeholder="e.g., 100000" />
        </FormField>
      </GridItem>
      <GridItem colSpan={2} />
      <GridItem colSpan={2}>
        <FormField>
          <FormFieldLabel>Expected total annual values</FormFieldLabel>
          <StackLayout direction="row" align="center">
            <Input placeholder="e.g., 100000" />
            <Text style={{ whiteSpace: "nowrap" }}>US Dollar</Text>
          </StackLayout>
        </FormField>
      </GridItem>
      <GridItem colSpan={4}>
        <div
          style={{
            borderBottom:
              "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-separable-secondary-borderColor)",
          }}
        />
      </GridItem>
      <GridItem colSpan={2}>
        <FormField>
          <FormFieldLabel>Client directed request?</FormFieldLabel>
          <RadioButtonGroup direction="horizontal">
            <RadioButton label="Yes" value="yes" />
            <RadioButton label="No" value="no" />
          </RadioButtonGroup>
        </FormField>
      </GridItem>
      <GridItem colSpan={3} />
      <GridItem colSpan={2}>
        <FormField>
          <FormFieldLabel>Expected total annual volumes</FormFieldLabel>
          <Input placeholder="e.g., 100000" />
        </FormField>
      </GridItem>
      <GridItem colSpan={3}>
        <FormField>
          <FormFieldLabel>Service description</FormFieldLabel>
          <Dropdown>
            <Option value="Value">Value</Option>
          </Dropdown>
          <FormFieldHelperText>
            Description of the services that are being requested
          </FormFieldHelperText>
        </FormField>
      </GridItem>
      <GridItem colSpan={4}>
        <div
          style={{
            borderBottom:
              "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-separable-secondary-borderColor)",
          }}
        />
      </GridItem>
    </GridLayout>
  );
};

export const SecondaryField = () => {
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
      style={{ width: "calc(var(--salt-size-base) * 12)" }}
    >
      <GridItem colSpan={4}>
        <FormField>
          <FormFieldLabel>Field label</FormFieldLabel>
          <Input variant="secondary" defaultValue="Value text" />
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </FormField>
      </GridItem>
      <GridItem colSpan={4}>
        <FormField>
          <FormFieldLabel>Field label</FormFieldLabel>
          <Dropdown variant="secondary" defaultSelected={["Value text"]}>
            <Option value="Value text">Value text</Option>
          </Dropdown>
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </FormField>
      </GridItem>
      <GridItem colSpan={4}>
        <FormField>
          <FormFieldLabel>Field label</FormFieldLabel>
          <MultilineInput
            variant="secondary"
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

export const Compact = () => {
  return (
    <StackLayout gap={1} style={{ width: "calc(var(--salt-size-base) * 12)" }}>
      <FormField labelPlacement="right">
        <FormFieldLabel>Label</FormFieldLabel>
        <Dropdown variant="secondary" defaultSelected={["Value text"]}>
          <Option value="Value text">Value text</Option>
        </Dropdown>
      </FormField>
      <FormField labelPlacement="right">
        <FormFieldLabel>Label</FormFieldLabel>
        <Dropdown variant="secondary" defaultSelected={["Value text"]}>
          <Option value="Value text">Value text</Option>
        </Dropdown>
      </FormField>
      <FormField labelPlacement="right">
        <FormFieldLabel>Label</FormFieldLabel>
        <Dropdown variant="secondary" defaultSelected={["Value text"]}>
          <Option value="Value text">Value text</Option>
        </Dropdown>
      </FormField>
      <FormField labelPlacement="right">
        <FormFieldLabel>Label</FormFieldLabel>
        <Dropdown variant="secondary" defaultSelected={["Value text"]}>
          <Option value="Value text">Value text</Option>
        </Dropdown>
      </FormField>
    </StackLayout>
  );
};
