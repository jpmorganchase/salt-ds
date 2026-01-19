import {
  Dropdown,
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  GridItem,
  GridLayout,
  Input,
  Option,
  StackLayout,
} from "@salt-ds/core";
import type { FormContentProps } from "./wizard.stories";

export const AccountDetailsContent = ({
  formData,
  stepFieldValidation,
  handleInputChange,
  handleSelectChange,
  onBlur,
}: FormContentProps) => {
  return (
    <GridLayout columns={2} style={{ width: "100%" }}>
      <GridItem>
        <StackLayout>
          <FormField validationStatus={stepFieldValidation.fullName?.status}>
            <FormFieldLabel>Full name</FormFieldLabel>
            <Input
              inputProps={{
                name: "fullName",
                onChange: handleInputChange,
                onBlur,
                value: formData.fullName,
              }}
            />
            {stepFieldValidation.fullName?.status && (
              <FormFieldHelperText>
                {stepFieldValidation.fullName.message}
              </FormFieldHelperText>
            )}
          </FormField>
          <FormField validationStatus={stepFieldValidation.phoneNumber?.status}>
            <FormFieldLabel>Phone Number</FormFieldLabel>
            <Input
              inputProps={{
                name: "phoneNumber",
                onChange: handleInputChange,
                onBlur,

                value: formData.phoneNumber,
              }}
            />
            {stepFieldValidation.phoneNumber?.status && (
              <FormFieldHelperText>
                {stepFieldValidation.phoneNumber.message}
              </FormFieldHelperText>
            )}
          </FormField>
          <FormField
            validationStatus={stepFieldValidation.emailAddress?.status}
          >
            <FormFieldLabel>Email Address</FormFieldLabel>
            <Input
              inputProps={{
                name: "emailAddress",
                onChange: handleInputChange,
                onBlur,

                value: formData.emailAddress,
              }}
            />
            {stepFieldValidation.emailAddress?.status && (
              <FormFieldHelperText>
                {stepFieldValidation.emailAddress.message}
              </FormFieldHelperText>
            )}
          </FormField>
        </StackLayout>
      </GridItem>

      <GridItem>
        <StackLayout>
          <FormField validationStatus={stepFieldValidation.address1?.status}>
            <FormFieldLabel>Address 1</FormFieldLabel>
            <Input
              inputProps={{
                name: "address1",
                onChange: handleInputChange,
                onBlur,

                value: formData.address1,
              }}
            />
            {stepFieldValidation.address1?.status && (
              <FormFieldHelperText>
                {stepFieldValidation.address1.message}
              </FormFieldHelperText>
            )}
          </FormField>
          <FormField necessity="optional">
            <FormFieldLabel>Address 2</FormFieldLabel>
            <Input
              inputProps={{
                name: "address2",
                onChange: handleInputChange,
                onBlur,
                value: formData.address2,
              }}
            />
            <FormFieldHelperText>
              Flat, Apt, Suite, Floor, Building etc.
            </FormFieldHelperText>
          </FormField>

          <FlexLayout>
            <FormField
              validationStatus={stepFieldValidation.postalCode?.status}
            >
              <FormFieldLabel>Postal code/PLZ</FormFieldLabel>
              <Input
                inputProps={{
                  name: "postalCode",
                  onChange: handleInputChange,
                  onBlur,

                  value: formData.postalCode,
                }}
              />
              {stepFieldValidation.postalCode?.status && (
                <FormFieldHelperText>
                  {stepFieldValidation.postalCode.message}
                </FormFieldHelperText>
              )}
            </FormField>
            <FormField validationStatus={stepFieldValidation.city?.status}>
              <FormFieldLabel>Town/City</FormFieldLabel>
              <Input
                inputProps={{
                  name: "city",
                  onChange: handleInputChange,
                  onBlur,

                  value: formData.city,
                }}
              />
              {stepFieldValidation.city?.status ? (
                <FormFieldHelperText>
                  {stepFieldValidation.city.message}
                </FormFieldHelperText>
              ) : (
                <FormFieldHelperText>
                  Locality, Settlement etc.
                </FormFieldHelperText>
              )}
            </FormField>
          </FlexLayout>

          <FormField validationStatus={stepFieldValidation.country?.status}>
            <FormFieldLabel>Country</FormFieldLabel>
            <Dropdown
              name="country"
              value={formData.country}
              onSelectionChange={(_e, value) =>
                handleSelectChange?.(value[0], "country")
              }
            >
              <Option value="United Kingdom">United Kingdom</Option>
              <Option value="United States">United States</Option>
            </Dropdown>
            {stepFieldValidation.country?.status && (
              <FormFieldHelperText>
                {stepFieldValidation.country.message}
              </FormFieldHelperText>
            )}
          </FormField>
        </StackLayout>
      </GridItem>
    </GridLayout>
  );
};
