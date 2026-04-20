import {
  Card,
  Display3,
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
import { ArrowUpIcon } from "@salt-ds/icons";
import type { FormContentProps } from "./experience-customization.stories";

export const DataFormatContent = ({
  formData,
  handleRadioChange,
}: FormContentProps) => {
  return (
    <FlexLayout wrap>
      <StackLayout>
        <FlexItem>
          <FormField>
            <FormFieldLabel>Choose a data format</FormFieldLabel>
            <RadioButtonGroup
              onChange={handleRadioChange}
              name="currency"
              value={formData.currency}
            >
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
            <RadioButtonGroup
              onChange={handleRadioChange}
              name="currencyFormat"
              value={formData.currencyFormat}
            >
              <RadioButton label="Standard e.g. 1,000,000" value="standard" />
              <RadioButton label="Abbreviated e.g. 1m" value="abbreviated" />
            </RadioButtonGroup>
          </FormField>
        </FlexItem>
      </StackLayout>
      <FlexItem grow={1} align="center">
        <Card style={{ width: 260, margin: "0 auto" }}>
          <Text>
            <strong>{formData.currency.toUpperCase()}</strong>
          </Text>
          <Display3>
            {formData.currencyFormat === "standard" ? "1,000,000" : "1M"}{" "}
            <ArrowUpIcon
              aria-hidden
              style={{
                color: "var(--salt-sentiment-positive-foreground-decorative)",
              }}
            />
          </Display3>
          <Text color="success">+13,000 (+1.23%)</Text>
        </Card>
      </FlexItem>
    </FlexLayout>
  );
};
