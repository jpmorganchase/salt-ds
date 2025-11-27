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
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  Text,
} from "../../../src";
import { accountTypeOptions } from "./AccountTypeContent";
import type { AccountFormData } from "./wizard.stories";

export const ReviewAccountContent = ({
  formData,
}: {
  formData: AccountFormData;
}) => (
  <GridLayout columns={2}>
    <GridItem>
      <StackLayout>
        <Text styleAs="h3">Account details</Text>
        <StackLayout>
          <FormField>
            <FormFieldLabel>Full name</FormFieldLabel>
            <Input
              inputProps={{
                value: formData.fullName,
              }}
              readOnly
            />
          </FormField>
          <FormField>
            <FormFieldLabel>Phone Number</FormFieldLabel>
            <Input
              inputProps={{
                value: formData.phoneNumber,
              }}
              readOnly
            />
          </FormField>
          <FormField>
            <FormFieldLabel>Email Address</FormFieldLabel>
            <Input
              inputProps={{
                value: formData.emailAddress,
              }}
              readOnly
            />
          </FormField>
          <FormField>
            <FormFieldLabel>Address 1</FormFieldLabel>
            <Input
              inputProps={{
                value: formData.address1,
              }}
              readOnly
            />
          </FormField>
          <FormField necessity="optional">
            <FormFieldLabel>Address 2</FormFieldLabel>
            <Input
              inputProps={{
                value: formData.address2,
              }}
              readOnly
            />
            <FormFieldHelperText>
              Flat, Apt, Suite, Floor, Building etc.
            </FormFieldHelperText>
          </FormField>

          <FlexLayout>
            <FormField>
              <FormFieldLabel>Postal code/PLZ</FormFieldLabel>
              <Input
                inputProps={{
                  value: formData.postalCode,
                }}
                readOnly
              />
            </FormField>
            <FormField>
              <FormFieldLabel>Town/City</FormFieldLabel>
              <Input
                inputProps={{
                  value: formData.city,
                }}
                readOnly
              />
              <FormFieldHelperText>
                Locality, Settlement etc.
              </FormFieldHelperText>
            </FormField>
          </FlexLayout>

          <FormField>
            <FormFieldLabel>Country</FormFieldLabel>
            <Dropdown
              value={formData.country}
              defaultSelected={[formData.country]}
              readOnly
            >
              <Option value="United Kingdom">United Kingdom</Option>
              <Option value="United States">United States</Option>
            </Dropdown>
          </FormField>
        </StackLayout>
      </StackLayout>
    </GridItem>

    <GridItem>
      <StackLayout gap={5}>
        <StackLayout>
          <Text styleAs="h3">Account type</Text>
          <StackLayout>
            <FormField>
              <FormFieldLabel>Select Account Type</FormFieldLabel>
              <RadioButtonGroup
                direction="vertical"
                value={formData.accountType}
                readOnly
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
            </FormField>
          </StackLayout>
        </StackLayout>

        <StackLayout>
          <Text styleAs="h3">Additional info</Text>
          <StackLayout>
            <FormField necessity="optional">
              <FormFieldLabel>Initial Deposit Amount</FormFieldLabel>
              <Input
                inputMode="decimal"
                placeholder="0.00"
                startAdornment={<Text>$</Text>}
                inputProps={{
                  name: "initialDeposit",
                  value: formData.initialDeposit,
                  type: "number",
                }}
                readOnly
              />
            </FormField>
            <FormField necessity="optional">
              <FormFieldLabel>Beneficiary Name</FormFieldLabel>
              <Input
                inputProps={{
                  name: "beneficiaryName",
                  value: formData.beneficiaryName,
                }}
                readOnly
              />
            </FormField>
            <FormField necessity="optional">
              <FormFieldLabel>Source of Funds</FormFieldLabel>
              <Input
                inputProps={{
                  name: "sourceOfFunds",
                  value: formData.sourceOfFunds,
                }}
                readOnly
              />
            </FormField>
            <FormField necessity="optional">
              <FormFieldLabel>Paperless Statements</FormFieldLabel>
              <Dropdown
                name="paperlessStatements"
                value={formData.paperlessStatements}
                defaultSelected={[formData.paperlessStatements]}
                readOnly
              >
                <Option value="">Please select</Option>
                <Option value="Yes" />
                <Option value="No" />
              </Dropdown>
            </FormField>
          </StackLayout>
        </StackLayout>
      </StackLayout>
    </GridItem>
  </GridLayout>
);
