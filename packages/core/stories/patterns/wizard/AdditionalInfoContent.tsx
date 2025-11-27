import {
  Dropdown,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  Option,
  StackLayout,
  Text,
} from "@salt-ds/core";
import type { FormContentProps } from "./wizard.stories";

export const AdditionalInfoContent = ({
  formData,
  handleInputChange,
  handleSelectChange,
  onBlur,
  stepFieldValidation,
  style,
}: FormContentProps) => {
  return (
    <StackLayout style={style}>
      <FormField validationStatus={stepFieldValidation.initialDeposit?.status}>
        <FormFieldLabel>Initial Deposit Amount</FormFieldLabel>
        <Input
          placeholder="0.00"
          startAdornment={<Text>$</Text>}
          inputProps={{
            name: "initialDeposit",
            value: formData.initialDeposit,
            onChange: handleInputChange,
            onBlur,
            type: "number",
          }}
          inputMode="decimal"
        />
        {stepFieldValidation.initialDeposit?.status && (
          <FormFieldHelperText>
            {stepFieldValidation.initialDeposit.message}
          </FormFieldHelperText>
        )}
      </FormField>
      <FormField>
        <FormFieldLabel>Beneficiary Name</FormFieldLabel>
        <Input
          inputProps={{
            name: "beneficiaryName",
            value: formData.beneficiaryName,
            onChange: handleInputChange,
            onBlur,
          }}
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Source of Funds</FormFieldLabel>
        <Input
          inputProps={{
            name: "sourceOfFunds",
            value: formData.sourceOfFunds,
            onChange: handleInputChange,
            onBlur,
          }}
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Paperless Statements</FormFieldLabel>
        <Dropdown
          name="paperlessStatements"
          value={formData.paperlessStatements}
          onSelectionChange={(_e, value) =>
            handleSelectChange?.(value[0], "paperlessStatements")
          }
        >
          <Option value="">Please select</Option>
          <Option value="Yes" />
          <Option value="No" />
        </Dropdown>
      </FormField>
    </StackLayout>
  );
};
