import {
  Banner,
  BannerContent,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  Dropdown,
  FormField,
  FormFieldLabel,
  H3,
  Link,
  Option,
  ParentChildLayout,
  RadioButton,
  RadioButtonGroup,
  SplitLayout,
  StackLayout,
  Switch,
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemLabel,
  VerticalNavigationItemTrigger,
} from "@salt-ds/core";
import { type ReactElement, useState } from "react";

function PreferencesNavigation({
  items,
  location,
  onChange,
}: {
  items: string[];
  location: string;
  onChange: (location: string) => void;
}) {
  return (
    <VerticalNavigation
      aria-label="Experience customization sidebar"
      appearance="bordered"
      style={{ minWidth: "30ch" }}
    >
      {items.map((item) => (
        <VerticalNavigationItem key={item} active={location === item}>
          <VerticalNavigationItemContent>
            <VerticalNavigationItemTrigger
              onClick={() => onChange(item)}
              render={<button type="button" />}
            >
              <VerticalNavigationItemLabel>{item}</VerticalNavigationItemLabel>
            </VerticalNavigationItemTrigger>
          </VerticalNavigationItemContent>
        </VerticalNavigationItem>
      ))}
    </VerticalNavigation>
  );
}

type PreferenceSection =
  | "Foundation"
  | "Regional"
  | "Data format"
  | "Notification delivery";

interface PreferenceDialogFormData {
  displayDensity: string;
  acceptTerms: boolean;
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

function PreferencesContent({
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
  let content: ReactElement | undefined;

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
            <RadioButton label="Top left" value="Top left" />
            <RadioButton label="Top right" value="Top right" />
            <RadioButton label="Bottom left" value="Bottom left" />
            <RadioButton label="Bottom right" value="Bottom right" />
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
      <H3>{currentSection}</H3>
      <div>{content}</div>
    </StackLayout>
  );
}

export const PreferenceDialog = () => {
  const sections: PreferenceSection[] = [
    "Foundation",
    "Regional",
    "Data format",
    "Notification delivery",
  ];
  const [currentSection, setCurrentSection] = useState<PreferenceSection>(
    sections[0],
  );
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [view, setView] = useState<"parent" | "child">("parent");
  const [formData, setFormData] = useState<PreferenceDialogFormData>({
    displayDensity: "medium",
    acceptTerms: false,
    region: "United States",
    publicHolidayCalendar: "Selected country",
    firstDayOfWeek: "monday",
    timeFormat: "24-hour",
    measurementSystem: "metric",
    stockNameDisplay: "fullNameTicker",
    exchangeAndRegionDisplay: "both",
    visibleMetrics: "lastPrice",
    performanceChart: true,
    position: "Top right",
    autoDismiss: false,
    extendDisplayTime: false,
  });

  const handleSectionChange = (section: string) => {
    setView("child");
    setCurrentSection(section as PreferenceSection);
  };

  const handleDropdownChange = (
    field: keyof PreferenceDialogFormData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSwitchChange = (
    field: keyof PreferenceDialogFormData,
    checked: boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };

  const handleRadioChange = (
    field: keyof PreferenceDialogFormData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} aria-haspopup="dialog">
        Open preferences dialog
      </Button>
      <Dialog style={{ minHeight: "60%" }} open={open} onOpenChange={setOpen}>
        <DialogHeader header="Preferences" />
        <DialogContent>
          <ParentChildLayout
            gap={3}
            onCollapseChange={(newCollapsed) => setCollapsed(newCollapsed)}
            visibleView={view}
            parent={
              <PreferencesNavigation
                items={sections}
                location={currentSection}
                onChange={handleSectionChange}
              />
            }
            child={
              <PreferencesContent
                currentSection={currentSection}
                formData={formData}
                onDropdownChange={handleDropdownChange}
                onSwitchChange={handleSwitchChange}
                onRadioChange={handleRadioChange}
              />
            }
          />
        </DialogContent>
        <DialogActions>
          <SplitLayout
            startItem={
              collapsed && view === "child" ? (
                <Button
                  sentiment="accented"
                  appearance="transparent"
                  onClick={() => setView("parent")}
                >
                  Back
                </Button>
              ) : undefined
            }
            endItem={
              <StackLayout direction="row" gap={1}>
                <Button
                  sentiment="accented"
                  appearance="bordered"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  sentiment="accented"
                  appearance="solid"
                  onClick={() => setOpen(false)}
                >
                  Save
                </Button>
              </StackLayout>
            }
          />
        </DialogActions>
      </Dialog>
    </>
  );
};
