import type {
  ComponentProps,
  ReactElement,
  ElementType as ReactElementType,
  RefCallback,
} from "react";

type StoryFn<T = void> = T extends ReactElementType
  ? (args: ComponentProps<T>) => ReactElement
  : T extends void
    ? () => ReactElement
    : (args: T) => ReactElement;

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
import { useCallback, useRef, useState } from "react";

function PreferencesNavigation({
  items,
  location,
  onChange,
  currentItemRef,
}: {
  items: string[];
  location: string;
  onChange: (location: string) => void;
  currentItemRef: RefCallback<HTMLElement>;
}) {
  return (
    <VerticalNavigation
      aria-label="Preferences sections"
      appearance="indicator"
      style={{ minWidth: "30ch" }}
    >
      {items.map((item) => (
        <VerticalNavigationItem key={item} active={location === item}>
          <VerticalNavigationItemContent>
            <VerticalNavigationItemTrigger
              ref={location === item ? currentItemRef : undefined}
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

function PreferencesContent({
  currentSection,
  headingRef,
}: {
  currentSection: string;
  headingRef: RefCallback<HTMLHeadingElement>;
}) {
  let content: ReactElement | undefined;

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
          <FormFieldLabel>Auto-launch on startup</FormFieldLabel>
          <Switch checked />
          <FormFieldHelperText>
            Launch automatically at user login or system startup.
          </FormFieldHelperText>
        </FormField>
        <FormField>
          <FormFieldLabel>Launcher orientation</FormFieldLabel>
          <RadioButtonGroup value="horizontal" direction="horizontal">
            <RadioButton label="Horizontal" value="horizontal" />
            <RadioButton label="Vertical" value="vertical" />
          </RadioButtonGroup>
          <FormFieldHelperText>
            Set the default orientation of the launcher when the user starts.
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
      <H2 ref={headingRef} styleAs="h3" tabIndex={-1}>
        {currentSection}
      </H2>
      <div>{content}</div>
    </StackLayout>
  );
}

const PreferencesDialogTemplate: StoryFn = () => {
  const sections = ["Account", "General", "Grid", "Export"];
  const [open, setOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(sections[0]);
  const [collapsed, setCollapsed] = useState(false);
  const [view, setView] = useState<"parent" | "child">("parent");
  const pendingFocus = useRef<"settings" | "category" | null>(null);

  // Only move focus for an explicit collapsed-view navigation action, after
  // its destination mounts. Ordinary renders and resizing do not request focus.
  const focusSettings = useCallback((node: HTMLHeadingElement | null) => {
    if (node && pendingFocus.current === "settings") {
      node.focus();
      pendingFocus.current = null;
    }
  }, []);
  const focusCategory = useCallback((node: HTMLElement | null) => {
    if (node && pendingFocus.current === "category") {
      node.focus();
      pendingFocus.current = null;
    }
  }, []);

  const handleSectionChange = (section: string) => {
    pendingFocus.current = collapsed ? "settings" : null;
    setView("child");
    setCurrentSection(section);
  };

  const handleBack = () => {
    pendingFocus.current = "category";
    setView("parent");
  };

  return (
    <>
      <Button
        onClick={() => {
          setView("parent");
          setOpen(true);
        }}
      >
        Open preferences
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
                currentItemRef={focusCategory}
              />
            }
            child={
              <PreferencesContent
                currentSection={currentSection}
                headingRef={focusSettings}
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
                  onClick={handleBack}
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

export const PreferencesDialog = PreferencesDialogTemplate.bind({});

export const CollapsedPreferencesDialog = PreferencesDialogTemplate.bind({});
