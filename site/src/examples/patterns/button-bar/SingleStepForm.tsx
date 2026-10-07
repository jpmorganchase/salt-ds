import {
  Button,
  Dropdown,
  FlexItem,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  MultilineInput,
  Option,
  StackLayout,
} from "@salt-ds/core";

export const formFields = (
  <>
    <FormField>
      <FormFieldLabel>Field label</FormFieldLabel>
      <Input defaultValue="Value text" />
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </FormField>
    <FormField>
      <FormFieldLabel>Field label</FormFieldLabel>
      <Dropdown defaultSelected={["Value"]} style={{ width: "100%" }}>
        <Option value="Value">Value</Option>
      </Dropdown>
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </FormField>
    <FormField>
      <FormFieldLabel>Field label</FormFieldLabel>
      <MultilineInput bordered defaultValue="Value text" />
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </FormField>
  </>
);

export const SingleStepForm = () => {
  return (
    <StackLayout style={{ width: "330px" }}>
      {formFields}
      <StackLayout
        direction={{ xs: "column", sm: "row" }}
        style={{ width: "100%" }}
        gap={1}
      >
        <FlexItem>
          <Button sentiment="accented" style={{ width: "100%" }}>
            Submit
          </Button>
        </FlexItem>
        <FlexItem>
          <Button appearance="bordered" style={{ width: "100%" }}>
            Cancel
          </Button>
        </FlexItem>
      </StackLayout>
    </StackLayout>
  );
};
