import {
  Dropdown,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Option,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
} from "@salt-ds/core";
import type { CSSProperties } from "react";
import type { FormContentProps } from "./experience-customization.stories";

export const RegionalSettingsContent = ({
  formData,
  handleRadioChange,
  handleSelectChange,
  stepFieldValidation,
  style,
}: FormContentProps & { style?: CSSProperties }) => {
  return (
    <StackLayout style={style}>
      <FormField
        validationStatus={stepFieldValidation.language?.status}
        necessity="required"
      >
        <FormFieldLabel>Choose a language</FormFieldLabel>
        <Dropdown
          bordered
          placeholder="Select"
          name="language"
          value={formData.language}
          onSelectionChange={(_e, value) =>
            handleSelectChange?.(value[0], "language")
          }
        >
          <Option value="English">English</Option>
          <Option value="Spanish">Spanish</Option>
          <Option value="French">French</Option>
          <Option value="German">German</Option>
          <Option value="Italian">Italian</Option>
          <Option value="Portuguese">Portuguese</Option>
          <Option value="Chinese (Simplified)">Chinese (Simplified)</Option>
          <Option value="Chinese (Traditional)">Chinese (Traditional)</Option>
          <Option value="Japanese">Japanese</Option>
          <Option value="Korean">Korean</Option>
          <Option value="Arabic">Arabic</Option>
          <Option value="Hindi">Hindi</Option>
        </Dropdown>
        {stepFieldValidation.language?.status && (
          <FormFieldHelperText>
            {stepFieldValidation.language.message}
          </FormFieldHelperText>
        )}
      </FormField>
      <FormField>
        <FormFieldLabel>Region / Country</FormFieldLabel>
        <Dropdown
          bordered
          placeholder="Select"
          name="region"
          value={formData.region}
          onSelectionChange={(_e, value) =>
            handleSelectChange?.(value[0], "region")
          }
        >
          <Option value="United States">United States</Option>
          <Option value="Canada">Canada</Option>
          <Option value="United Kingdom">United Kingdom</Option>
          <Option value="Ireland">Ireland</Option>
          <Option value="France">France</Option>
          <Option value="Germany">Germany</Option>
          <Option value="Spain">Spain</Option>
          <Option value="Italy">Italy</Option>
          <Option value="Netherlands">Netherlands</Option>
          <Option value="Switzerland">Switzerland</Option>
          <Option value="India">India</Option>
          <Option value="Japan">Japan</Option>
          <Option value="Singapore">Singapore</Option>
          <Option value="Australia">Australia</Option>
        </Dropdown>
      </FormField>
      <FormField>
        <FormFieldLabel>Public holiday calendar</FormFieldLabel>
        <Dropdown
          bordered
          placeholder="Select"
          name="publicHolidayCalendar"
          value={formData.publicHolidayCalendar}
          onSelectionChange={(_e, value) =>
            handleSelectChange?.(value[0], "publicHolidayCalendar")
          }
        >
          <Option value="None">None (don’t apply public holidays)</Option>
          <Option value="selected-country">Selected country</Option>
          <Option value="United States (Federal)">
            United States (Federal)
          </Option>
          <Option value="United Kingdom (England & Wales)">
            United Kingdom (England & Wales)
          </Option>
          <Option value="Canada (Federal)">Canada (Federal)</Option>
          <Option value="India (National)">India (National)</Option>
          <Option value="Japan (National)">Japan (National)</Option>
          <Option value="Australia (National)">Australia (National)</Option>
        </Dropdown>
      </FormField>

      <FormField>
        <FormFieldLabel>First day of the week</FormFieldLabel>
        <RadioButtonGroup
          direction="horizontal"
          onChange={handleRadioChange}
          name="firstDayOfWeek"
          value={formData.firstDayOfWeek}
        >
          <RadioButton label="Sunday" value="sunday" />
          <RadioButton label="Monday" value="monday" />
          <RadioButton label="Saturday" value="saturday" />
        </RadioButtonGroup>
      </FormField>
      <FormField>
        <FormFieldLabel>Time format</FormFieldLabel>
        <RadioButtonGroup
          direction="horizontal"
          onChange={handleRadioChange}
          name="timeFormat"
          value={formData.timeFormat}
        >
          <RadioButton label="12-hour" value="12-hour" />
          <RadioButton label="24-hour" value="24-hour" />
        </RadioButtonGroup>
      </FormField>
      <FormField>
        <FormFieldLabel>Measurement system</FormFieldLabel>
        <RadioButtonGroup
          direction="horizontal"
          onChange={handleRadioChange}
          name="measurementSystem"
          value={formData.measurementSystem}
        >
          <RadioButton label="Metric" value="metric" />
          <RadioButton label="Imperial" value="imperial" />
        </RadioButtonGroup>
      </FormField>
    </StackLayout>
  );
};
