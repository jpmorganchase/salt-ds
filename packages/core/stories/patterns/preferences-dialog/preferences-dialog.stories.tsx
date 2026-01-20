import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  Dropdown,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  H2,
  Input,
  NumberInput,
  ParentChildLayout,
  RadioButton,
  RadioButtonGroup,
  SplitLayout,
  StackLayout,
  Switch,
  Text,
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemLabel,
  VerticalNavigationItemTrigger,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useState } from "react";

export default {
  title: "Patterns/Preferences Dialog",
} as Meta;

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
      aria-label="Basic indicator sidebar"
      appearance="indicator"
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

function PreferencesContent({ currentSection }: { currentSection: string }) {
  let content;

  if (currentSection === "Account") {
    content = (
      <StackLayout gap={3}>
        <FormField>
          <FormFieldLabel>Name</FormFieldLabel>
          <Input defaultValue="User name" readOnly />
        </FormField>
        <FormField>
          <FormFieldLabel>Company</FormFieldLabel>
          <Input defaultValue="Company" readOnly />
        </FormField>
        <FormField>
          <FormFieldLabel>Email</FormFieldLabel>
          <Input defaultValue="user@example.com" readOnly />
          <FormFieldHelperText>
            This is managed by your company.
          </FormFieldHelperText>
        </FormField>
        <FormField>
          <FormFieldLabel>Security type</FormFieldLabel>
          <Dropdown value="Password" />
        </FormField>
      </StackLayout>
    );
  }

  if (currentSection === "General") {
    content = (
      <StackLayout gap={3}>
        <FormField>
          <FormFieldLabel>Auto launch on start up</FormFieldLabel>
          <Switch checked />
          <FormFieldHelperText>
            Auto-launch desktop when user logs in or starts
          </FormFieldHelperText>
        </FormField>
        <FormField>
          <FormFieldLabel>Launcher orientation</FormFieldLabel>
          <RadioButtonGroup value="horizontal" direction="horizontal">
            <RadioButton label="Horizontal" value="horizontal" />
            <RadioButton label="Vertical" value="vertical" />
          </RadioButtonGroup>
          <FormFieldHelperText>
            Set the default orientation of the launcher when the user starts
          </FormFieldHelperText>
        </FormField>
      </StackLayout>
    );
  }

  if (currentSection === "Grid") {
    content = (
      <StackLayout gap={1}>
        <FormField labelPlacement="left">
          <FormFieldLabel>Grid row size</FormFieldLabel>
          <RadioButtonGroup value="medium" direction="horizontal">
            <RadioButton label="Small" value="small" />
            <RadioButton label="Medium" value="medium" />
            <RadioButton label="Large" value="large" />
          </RadioButtonGroup>
        </FormField>
        <FormField labelPlacement="left">
          <FormFieldLabel>Column filters</FormFieldLabel>
          <Switch label="Value" />
        </FormField>
        <FormField labelPlacement="left">
          <FormFieldLabel>Zebra stripes</FormFieldLabel>
          <Switch label="Value" checked />
        </FormField>
        <FormField labelPlacement="left">
          <FormFieldLabel>Status bar</FormFieldLabel>
          <Switch label="Value" />
        </FormField>
        <FormField labelPlacement="left">
          <FormFieldLabel>Column styling</FormFieldLabel>
          <Switch label="Value" checked />
        </FormField>
        <FormField labelPlacement="left">
          <FormFieldLabel>Cell styling</FormFieldLabel>
          <Switch label="Value" checked />
        </FormField>
        <FormField labelPlacement="left">
          <FormFieldLabel>Row styling</FormFieldLabel>
          <Switch label="Value" />
        </FormField>
        <FormField labelPlacement="left">
          <FormFieldLabel>Cell flashing</FormFieldLabel>
          <RadioButtonGroup value="off" direction="horizontal">
            <RadioButton label="Off" value="off" />
            <RadioButton label="All" value="all" />
            <RadioButton label="Specific cells" value="specific" />
          </RadioButtonGroup>
        </FormField>
      </StackLayout>
    );
  }

  if (currentSection === "Export") {
    content = (
      <StackLayout>
        <Text>
          Default global settings for all new dashboards and widgets created.
        </Text>
        <StackLayout gap={1}>
          <FormField labelPlacement="left">
            <FormFieldLabel>File format</FormFieldLabel>
            <Dropdown value="PNG" />
          </FormField>
          <FormField labelPlacement="left">
            <FormFieldLabel>Publication style</FormFieldLabel>
            <Dropdown value="None" />
          </FormField>
          <FormField labelPlacement="left">
            <FormFieldLabel>Widget export width</FormFieldLabel>
            <NumberInput
              value="360"
              endAdornment={
                <Text>
                  <strong>PX</strong>
                </Text>
              }
            />
          </FormField>
          <FormField labelPlacement="left">
            <FormFieldLabel>Dashboard size</FormFieldLabel>
            <Dropdown value="To scale" />
          </FormField>
          <FormField labelPlacement="left">
            <FormFieldLabel>Include title</FormFieldLabel>
            <Dropdown value="Yes" />
          </FormField>
        </StackLayout>
      </StackLayout>
    );
  }

  return (
    <StackLayout>
      <H2 styleAs="h3" style={{ margin: 0 }}>
        {currentSection}
      </H2>
      <div>{content}</div>
    </StackLayout>
  );
}

const PreferencesDialogTemplate: StoryFn = () => {
  const sections = ["Account", "General", "Grid", "Export"];
  const [currentSection, setCurrentSection] = useState(sections[0]);
  const [collapsed, setCollapsed] = useState(false);
  const [view, setView] = useState<"parent" | "child">("parent");

  const handleSectionChange = (section: string) => {
    setView("child");
    setCurrentSection(section);
  };

  return (
    <Dialog open>
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
          child={<PreferencesContent currentSection={currentSection} />}
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
              <Button sentiment="accented" appearance="bordered">
                Cancel
              </Button>
              <Button sentiment="accented" appearance="solid">
                Save
              </Button>
            </StackLayout>
          }
        />
      </DialogActions>
    </Dialog>
  );
};

export const PreferencesDialog = PreferencesDialogTemplate.bind({});

export const CollapsedPreferencesDialog = PreferencesDialogTemplate.bind({});

CollapsedPreferencesDialog.globals = {
  viewport: { value: "sm" },
};
