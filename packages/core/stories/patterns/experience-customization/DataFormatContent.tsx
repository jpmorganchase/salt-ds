import {
  Card,
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  Text,
} from "@salt-ds/core";

export const DataFormatContent = () => {
  return (
    <FlexLayout>
      <StackLayout>
        <FlexItem>
          <FormField>
            <FormFieldLabel>Choose a data format</FormFieldLabel>
            <RadioButtonGroup>
              <RadioButton label="USD" value="usd" />
              <RadioButton label="EUR" value="eur" />
            </RadioButtonGroup>
            <FormFieldHelperText>
              Used for report display; does not convert transaction currency.
            </FormFieldHelperText>
          </FormField>
        </FlexItem>
        <FlexItem>
          <FormField>
            <FormFieldLabel>Display amounts</FormFieldLabel>
            <RadioButtonGroup>
              <RadioButton label="USD" value="usd" />
              <RadioButton label="EUR" value="eur" />
            </RadioButtonGroup>
          </FormField>
        </FlexItem>
      </StackLayout>
      <FlexItem>
        <Card>
          <Text>USD</Text>
          <Text>1,000,000</Text>
          <Text>+13,000(+1.23%)</Text>
        </Card>
      </FlexItem>
    </FlexLayout>
  );
};
