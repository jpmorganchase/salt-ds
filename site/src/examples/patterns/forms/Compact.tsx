import {
  Dropdown,
  FormField,
  FormFieldLabel,
  Option,
  StackLayout,
} from "@salt-ds/core";

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
