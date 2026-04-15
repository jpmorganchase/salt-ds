import {
  Dropdown,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Option,
  StackLayout,
  Switch,
} from "@salt-ds/core";
import { LocationIcon, SearchIcon } from "@salt-ds/icons";
import type { FormContentProps } from "./experience-customization.stories";

export const RegionalSettingsContent = ({
  formData,
  handleCheckboxChange,
  handleSelectChange,
}: FormContentProps) => {
  return (
    <StackLayout style={{ width: "50%" }}>
      <FormField>
        <FormFieldLabel>Choose a language</FormFieldLabel>
        <Dropdown
          startAdornment={<SearchIcon />}
          bordered
          placeholder="Select language"
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
        </Dropdown>
        <FormFieldHelperText>
          Selecting a language sets the default interface text for your
          workspace
        </FormFieldHelperText>
      </FormField>
      <FormField>
        <FormFieldLabel>Choose a time zone (regions)</FormFieldLabel>
        <Dropdown
          startAdornment={<LocationIcon />}
          bordered
          placeholder="Select time zone"
          name="timezone"
          value={formData.timezone}
          onSelectionChange={(_e, value) =>
            handleSelectChange?.(value[0], "timezone")
          }
        >
          <Option value="Pacific/Midway">(UTC-11:00) Pacific/Midway</Option>
          <Option value="Pacific/Honolulu">(UTC-10:00) Hawaii</Option>
          <Option value="America/Anchorage">(UTC-09:00) Alaska</Option>
          <Option value="America/Los_Angeles">
            (UTC-08:00) Pacific Time (US & Canada)
          </Option>
          <Option value="America/Denver">
            (UTC-07:00) Mountain Time (US & Canada)
          </Option>
          <Option value="America/Chicago">
            (UTC-06:00) Central Time (US & Canada)
          </Option>
          <Option value="America/New_York">
            (UTC-05:00) Eastern Time (US & Canada)
          </Option>
          <Option value="America/Halifax">
            (UTC-04:00) Atlantic Time (Canada)
          </Option>
          <Option value="America/Argentina/Buenos_Aires">
            (UTC-03:00) Buenos Aires
          </Option>
          <Option value="Atlantic/South_Georgia">
            (UTC-02:00) Mid-Atlantic
          </Option>
          <Option value="Atlantic/Azores">(UTC-01:00) Azores</Option>
          <Option value="Europe/London">(UTC+00:00) London</Option>
          <Option value="Europe/Berlin">(UTC+01:00) Berlin</Option>
          <Option value="Europe/Paris">(UTC+01:00) Paris</Option>
          <Option value="Europe/Athens">(UTC+02:00) Athens</Option>
        </Dropdown>
        <FormFieldHelperText>
          This ensures all activity logs and scheduled tasks align with your
          local time.
        </FormFieldHelperText>
      </FormField>
      <FormField>
        <FormFieldLabel>Automatic translation</FormFieldLabel>
        <Switch
          label="Automatically translate descriptions and reviews to English."
          name="autoTranslate"
          checked={formData.autoTranslate}
          onChange={handleCheckboxChange}
        />
      </FormField>
    </StackLayout>
  );
};
