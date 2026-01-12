import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  Text,
} from "../../../src";
import type { FormContentProps } from "./wizard.stories";

export const accountTypeOptions = [
  {
    value: "checking",
    title: "Checking Account",
    subtitle: "Everyday banking needs",
  },
  {
    value: "savings",
    title: "Savings Account",
    subtitle: "Save and earn interest",
  },
  {
    value: "moneyMarket",
    title: "Money Market Account",
    subtitle: "Higher interest, flexible access",
  },
  {
    value: "cd",
    title: "Certificate of Deposit (CD)",
    subtitle: "Fixed term, higher rates",
  },
  {
    value: "business",
    title: "Business Account",
    subtitle: "For business transactions",
  },
  {
    value: "trust",
    title: "Trust Account",
    subtitle: "Estate and trust management",
  },
];

export const AccountTypeContent = ({
  formData,
  stepFieldValidation,
  handleRadioChange,
}: FormContentProps) => {
  return (
    <FormField validationStatus={stepFieldValidation.accountType?.status}>
      <FormFieldLabel>Select Account Type</FormFieldLabel>
      <RadioButtonGroup
        direction="vertical"
        onChange={handleRadioChange}
        value={formData.accountType}
      >
        {accountTypeOptions.map(({ value, title, subtitle }) => (
          <RadioButton
            key={value}
            label={
              <StackLayout align="start" gap={0.5}>
                <Text>{title}</Text>
                <Text color="secondary" styleAs="label">
                  {subtitle}
                </Text>
              </StackLayout>
            }
            name="accountType"
            value={value}
          />
        ))}
      </RadioButtonGroup>
      {stepFieldValidation.accountType?.status && (
        <FormFieldHelperText>
          {stepFieldValidation.accountType.message}
        </FormFieldHelperText>
      )}
    </FormField>
  );
};
