import {
  Banner,
  BannerContent,
  Dropdown,
  FormField,
  FormFieldLabel,
  H3,
  Link,
  Option,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  Switch,
} from "@salt-ds/core";

export type PreferenceSection =
  | "Foundation"
  | "Regional"
  | "Data format"
  | "Notification delivery";

export interface PreferenceDialogFormData {
  displayDensity: string;
  acceptTerms: boolean;
  language: string;
  region: string;
  publicHolidayCalendar: string;
  firstDayOfWeek: string;
  timeFormat: string;
  measurementSystem: string;
  stockNameDisplay: string;
  exchangeAndRegionDisplay: string;
  visibleMetrics: string;
  performanceChart: boolean;
  position: string;
  autoDismiss: boolean;
  extendDisplayTime: boolean;
}

export function PreferencesContent({
  currentSection,
  formData,
  onDropdownChange,
  onSwitchChange,
  onRadioChange,
}: {
  currentSection: PreferenceSection;
  formData: PreferenceDialogFormData;
  onDropdownChange: (
    field: keyof PreferenceDialogFormData,
    value: string,
  ) => void;
  onSwitchChange: (
    field: keyof PreferenceDialogFormData,
    checked: boolean,
  ) => void;
  onRadioChange: (field: keyof PreferenceDialogFormData, value: string) => void;
}) {
  let content;

  if (currentSection === "Foundation") {
    content = (
      <StackLayout gap={3}>
        {formData.displayDensity === "high" && (
          <Banner status="warning">
            <BannerContent>
              High density doesn't meet the{" "}
              <Link
                href="https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html"
                target="_blank"
                rel="noopener"
              >
                WCAG-defined minimum target size
              </Link>
              , which may reduce readability and make interactions harder.
            </BannerContent>
          </Banner>
        )}
        <FormField>
          <FormFieldLabel>Choose a density</FormFieldLabel>
          <RadioButtonGroup
            value={formData.displayDensity}
            onChange={(event) =>
              onRadioChange("displayDensity", event.target.value)
            }
            direction="horizontal"
          >
            <RadioButton label="High density" value="high" />
            <RadioButton label="Medium density" value="medium" />
            <RadioButton label="Low density" value="low" />
          </RadioButtonGroup>
        </FormField>
      </StackLayout>
    );
  }

  if (currentSection === "Regional") {
    content = (
      <StackLayout gap={3}>
        <FormField>
          <FormFieldLabel>Choose a language</FormFieldLabel>
          <Dropdown
            bordered
            placeholder="Select"
            value={formData.language}
            onSelectionChange={(_event, value) =>
              onDropdownChange("language", value[0])
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
        </FormField>
        <FormField>
          <FormFieldLabel>Region/Country</FormFieldLabel>
          <Dropdown
            bordered
            placeholder="Select"
            value={formData.region}
            onSelectionChange={(_event, value) =>
              onDropdownChange("region", value[0])
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
            value={formData.publicHolidayCalendar}
            onSelectionChange={(_event, value) =>
              onDropdownChange("publicHolidayCalendar", value[0])
            }
          >
            <Option value="None">None (don't apply public holidays)</Option>
            <Option value="Selected country">Selected country</Option>
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
            value={formData.firstDayOfWeek}
            onChange={(event) =>
              onRadioChange("firstDayOfWeek", event.target.value)
            }
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
            value={formData.timeFormat}
            onChange={(event) =>
              onRadioChange("timeFormat", event.target.value)
            }
          >
            <RadioButton label="12-hour" value="12-hour" />
            <RadioButton label="24-hour" value="24-hour" />
          </RadioButtonGroup>
        </FormField>
        <FormField>
          <FormFieldLabel>Measurement system</FormFieldLabel>
          <RadioButtonGroup
            direction="horizontal"
            value={formData.measurementSystem}
            onChange={(event) =>
              onRadioChange("measurementSystem", event.target.value)
            }
          >
            <RadioButton label="Metric" value="metric" />
            <RadioButton label="Imperial" value="imperial" />
          </RadioButtonGroup>
        </FormField>
      </StackLayout>
    );
  }

  if (currentSection === "Data format") {
    content = (
      <StackLayout gap={3}>
        <FormField>
          <FormFieldLabel>Stock name display</FormFieldLabel>
          <RadioButtonGroup
            direction="horizontal"
            value={formData.stockNameDisplay}
            onChange={(event) =>
              onRadioChange("stockNameDisplay", event.target.value)
            }
          >
            <RadioButton label="Ticker only" value="tickerOnly" />
            <RadioButton label="Ticker and full name" value="fullNameTicker" />
          </RadioButtonGroup>
        </FormField>
        <FormField>
          <FormFieldLabel>Exchange and region</FormFieldLabel>
          <RadioButtonGroup
            direction="horizontal"
            value={formData.exchangeAndRegionDisplay}
            onChange={(event) =>
              onRadioChange("exchangeAndRegionDisplay", event.target.value)
            }
          >
            <RadioButton label="Text only" value="text" />
            <RadioButton label="Flag only" value="flag" />
            <RadioButton label="Both" value="both" />
          </RadioButtonGroup>
        </FormField>
        <FormField>
          <FormFieldLabel>Visible metrics</FormFieldLabel>
          <RadioButtonGroup
            direction="horizontal"
            value={formData.visibleMetrics}
            onChange={(event) =>
              onRadioChange("visibleMetrics", event.target.value)
            }
          >
            <RadioButton label="Last price" value="lastPrice" />
            <RadioButton label="Absolute change" value="absolute" />
            <RadioButton label="Market Cap" value="marketCap" />
          </RadioButtonGroup>
        </FormField>
        <FormField>
          <FormFieldLabel>Performance chart</FormFieldLabel>
          <Switch
            checked={formData.performanceChart}
            onChange={(event) =>
              onSwitchChange("performanceChart", event.target.checked)
            }
            label={formData.performanceChart ? "Visible" : "Hidden"}
          />
        </FormField>
      </StackLayout>
    );
  }

  if (currentSection === "Notification delivery") {
    content = (
      <StackLayout gap={3}>
        <FormField>
          <FormFieldLabel>Choose a placement for notification</FormFieldLabel>
          <RadioButtonGroup
            direction="horizontal"
            value={formData.position}
            onChange={(event) => onRadioChange("position", event.target.value)}
          >
            <RadioButton label="Top left" value="top-left" />
            <RadioButton label="Top right" value="top-right" />
            <RadioButton label="Bottom left" value="bottom-left" />
            <RadioButton label="Bottom right" value="bottom-right" />
          </RadioButtonGroup>
        </FormField>
        <FormField>
          <FormFieldLabel>Automatically dismiss notifications</FormFieldLabel>
          <Switch
            label={formData.autoDismiss ? "On" : "Off"}
            name="autoDismiss"
            checked={formData.autoDismiss}
            onChange={(event) =>
              onSwitchChange("autoDismiss", event.target.checked)
            }
          />
        </FormField>
        <FormField>
          <FormFieldLabel>Extend notification display time</FormFieldLabel>
          <Switch
            label={formData.extendDisplayTime ? "On" : "Off"}
            name="extendDisplayTime"
            checked={formData.extendDisplayTime}
            onChange={(event) =>
              onSwitchChange("extendDisplayTime", event.target.checked)
            }
          />
        </FormField>
      </StackLayout>
    );
  }

  return (
    <StackLayout>
      <H3 style={{ margin: 0 }}>{currentSection}</H3>
      <div>{content}</div>
    </StackLayout>
  );
}
