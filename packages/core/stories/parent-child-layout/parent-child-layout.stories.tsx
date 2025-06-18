import {
  Button,
  Dialog,
  DialogCloseButton,
  DialogContent,
  Dropdown,
  FlexLayout,
  FormField,
  FormFieldLabel,
  H2,
  Input,
  Label,
  NavigationItem,
  Option,
  ParentChildLayout,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import {
  ChevronLeftIcon,
  ExportIcon,
  LaptopIcon,
  UserIcon,
} from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";

import "./parent-child-layout.stories.css";

export default {
  title: "Lab/Layout/Parent Child Layout",
  component: ParentChildLayout,
  args: {
    onCollapseChange: fn(),
  },
} as Meta<typeof ParentChildLayout>;

const parent = <div className="parent-content">Parent</div>;

const child = <div className="child-content">Child</div>;

export const Default: StoryFn<typeof ParentChildLayout> = (args) => (
  <ParentChildLayout {...args} className="parent-child-layout" />
);
Default.args = { parent, child };

export const Collapsed: StoryFn<typeof ParentChildLayout> = (args) => {
  const [visibleView, setVisibleView] = useState<"child" | "parent">("child");

  const handleChange = () => {
    visibleView === "child"
      ? setVisibleView("parent")
      : setVisibleView("child");
  };

  return (
    <StackLayout align="center">
      <ParentChildLayout
        {...args}
        className="parent-child-layout"
        collapseAtBreakpoint="md"
        visibleView={visibleView}
      />
      <StackLayout align="center" gap={1}>
        <Label>Visible View: </Label>
        <ToggleButtonGroup defaultValue="child" onChange={handleChange}>
          <ToggleButton value="parent">Parent</ToggleButton>
          <ToggleButton value="child">Child</ToggleButton>
        </ToggleButtonGroup>
      </StackLayout>
    </StackLayout>
  );
};

Collapsed.args = {
  parent,
  child,
};

export const ReducedMotion: StoryFn<typeof ParentChildLayout> = (args) => {
  const [visibleView, setVisibleView] = useState<"child" | "parent">("child");

  const handleChange = () => {
    visibleView === "child"
      ? setVisibleView("parent")
      : setVisibleView("child");
  };

  return (
    <StackLayout align="center">
      <div>
        <p>In order to test this on MacOS, follow these steps: </p>
        <p>
          Go to System Preferences, select the Accessibility category, select
          the Display tab, and enable the Reduce Motion option.
        </p>
      </div>
      <ParentChildLayout
        {...args}
        className="parent-child-layout"
        visibleView={visibleView}
        collapseAtBreakpoint="md"
      />
      <StackLayout align="center" gap={1}>
        <Label>Visible View: </Label>
        <ToggleButtonGroup defaultValue="child" onChange={handleChange}>
          <ToggleButton value="parent">Parent</ToggleButton>
          <ToggleButton value="child">Child</ToggleButton>
        </ToggleButtonGroup>
      </StackLayout>
    </StackLayout>
  );
};

ReducedMotion.args = {
  collapseAtBreakpoint: "xl",
  parent,
  child,
};

// Preferences Dialog

const languages = [
  "English",
  "French",
  "German",
  "Italian",
  "Spanish",
  "Turkish",
  "Ukranian",
];

const displayView = () => (
  <StackLayout gap={1}>
    <FormField labelPlacement="left">
      <FormFieldLabel>Language</FormFieldLabel>
      <Dropdown>
        {languages.map((lang) => (
          <Option value={lang} key={lang}>
            {lang}
          </Option>
        ))}
      </Dropdown>
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Time format</FormFieldLabel>
      <RadioButtonGroup direction="horizontal">
        <RadioButton label="12 hour" />
        <RadioButton checked label="24 hour" />
      </RadioButtonGroup>
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Link destination</FormFieldLabel>
      <RadioButtonGroup>
        <RadioButton label="Same window" />
        <RadioButton checked label="New window" />
      </RadioButtonGroup>
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Date format</FormFieldLabel>
      <RadioButtonGroup direction="horizontal">
        <RadioButton label="DD/MM/YY" />
        <RadioButton checked label="MM/DD/YY" />
      </RadioButtonGroup>
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Number format</FormFieldLabel>
      <RadioButtonGroup direction="horizontal">
        <RadioButton label="1,000.00" />
        <RadioButton checked label="1.000,00" />
      </RadioButtonGroup>
    </FormField>
  </StackLayout>
);

const accountView = () => (
  <StackLayout gap={1}>
    <FormField labelPlacement="left">
      <FormFieldLabel>Full name</FormFieldLabel>
      <Input />
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Company ID</FormFieldLabel>
      <Input />
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Email</FormFieldLabel>
      <Input />
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Security type</FormFieldLabel>
      <Dropdown defaultSelected={["Password"]}>
        <Option value="Password" key="Password">
          Password
        </Option>
        <Option value="Soft token" key="Soft token">
          Soft token
        </Option>
        <Option value="Biometric" key="Biometric">
          Biometric
        </Option>
      </Dropdown>
    </FormField>
  </StackLayout>
);

const exportView = () => (
  <StackLayout gap={1}>
    <FormField labelPlacement="left">
      <FormFieldLabel>File type</FormFieldLabel>
      <Dropdown defaultSelected={["PNG"]}>
        <Option value="JPG" key="JPG">
          JPG
        </Option>
        <Option value="PDF" key="PDF">
          PDF
        </Option>
        <Option value="PNG" key="PNG">
          PNG
        </Option>
        <Option value="SVG" key="SVG">
          SVG
        </Option>
      </Dropdown>
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Size</FormFieldLabel>
      <Dropdown defaultSelected={["1x"]}>
        <Option value="1x" key="1x">
          1x
        </Option>
        <Option value="2x" key="2x">
          2x
        </Option>
        <Option value="3x" key="3x">
          3x
        </Option>
      </Dropdown>
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Suffix</FormFieldLabel>
      <Input />
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Color profile</FormFieldLabel>
      <Dropdown defaultSelected={["Same as current (sRGB)"]}>
        <Option value="Same as current (sRGB)" key="Same as current (sRGB)">
          Same as current (sRGB)
        </Option>
        <Option value="Display P3" key="Display P3">
          Display P3
        </Option>
      </Dropdown>
    </FormField>
  </StackLayout>
);

export const PreferencesDialog: StoryFn<typeof ParentChildLayout> = (args) => {
  const items = [
    {
      label: "Display",
      icon: <LaptopIcon />,
      view: displayView,
    },
    {
      label: "Account",
      icon: <UserIcon />,
      view: accountView,
    },
    {
      label: "Export",
      icon: <ExportIcon />,
      view: exportView,
    },
  ];

  const [active, setActive] = useState(items[0]);

  const [visibleView, setVisibleView] = useState<"child" | "parent">("child");
  const [collapsed, setCollapsed] = useState<boolean>();
  const [open, setOpen] = useState<boolean>(false);

  const showParent = () => {
    setVisibleView("parent");
  };
  const showChild = () => {
    setVisibleView("child");
  };

  const parent = (
    <nav className="preferences-layout-parent-view">
      <ul>
        {items.map((item) => (
          <li key={item.label}>
            <NavigationItem
              active={active.label === item.label}
              href="#"
              orientation="vertical"
              onClick={(event) => {
                event.preventDefault();
                setActive(item);
                showChild();
              }}
            >
              {item.icon} {item.label}
            </NavigationItem>
          </li>
        ))}
      </ul>
    </nav>
  );

  const child = (
    <FlexLayout direction="column" className="preferences-layout-child-view">
      <FlexLayout gap={1}>
        {visibleView === "child" && collapsed && (
          <Button
            onClick={showParent}
            appearance="transparent"
            aria-label="Back"
          >
            <ChevronLeftIcon />
          </Button>
        )}
        <H2>{active.label}</H2>
      </FlexLayout>
      {active.view?.()}
    </FlexLayout>
  );

  const handleCollapsed = (isCollapsed: boolean) => {
    setCollapsed(isCollapsed);
  };

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const onOpenChange = (value: boolean) => {
    setOpen(value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={handleRequestOpen}>Open Preferences Dialog</Button>
      <Dialog size={"medium"} open={open} onOpenChange={onOpenChange}>
        <DialogCloseButton onClick={handleClose} />
        <DialogContent>
          <ParentChildLayout
            {...args}
            visibleView={visibleView}
            parent={parent}
            child={child}
            onCollapseChange={handleCollapsed}
            gap={1}
            className="preferences-layout-container"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

PreferencesDialog.args = {
  collapseAtBreakpoint: "sm",
};
