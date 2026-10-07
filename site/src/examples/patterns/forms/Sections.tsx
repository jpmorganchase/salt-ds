import {
  Dropdown,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  GridItem,
  GridLayout,
  Input,
  Option,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  Text,
} from "@salt-ds/core";

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
