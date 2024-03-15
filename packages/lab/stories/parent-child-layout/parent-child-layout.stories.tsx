import { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";

import {
  ChevronLeftIcon,
  ExportIcon,
  LaptopIcon,
  UserIcon,
} from "@salt-ds/icons";
import {
  ParentChildLayout,
  StackedViewElement,
} from "@salt-ds/lab";
import {
  Button,
  FlexLayout,
  FormField,
  FormFieldLabel,
  H2,
  Input,
  NavigationItem,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  ToggleButton,
  ToggleButtonGroup,
  DropdownNext,
  Option,
} from "@salt-ds/core";

import "./parent-child-layout.stories.css";

export default {
  title: "Lab/Layout/Parent Child Layout",
  component: ParentChildLayout,
} as Meta<typeof ParentChildLayout>;

const parent = <div className="parent-content">Parent</div>;

const child = <div className="child-content">Child</div>;

export const Default: StoryFn<typeof ParentChildLayout> = (args) => (
  <ParentChildLayout {...args} className="parent-child-layout" />
);
Default.args = { parent, child };

export const Collapsed: StoryFn<typeof ParentChildLayout> = (args) => {
  const [currentView, setCurrentView] = useState<StackedViewElement>("parent");

  const handleParent = () => {
    setCurrentView("parent");
  };
  const handleChild = () => {
    setCurrentView("child");
  };

  return (
    <StackLayout align="center">
      <ParentChildLayout
        {...args}
        className="parent-child-layout"
        collapsedViewElement={currentView}
        collapseAtBreakpoint="md"
      />
      <ToggleButtonGroup defaultValue="parent">
        <ToggleButton value="parent" onClick={handleParent}>
          Parent
        </ToggleButton>
        <ToggleButton value="child" onClick={handleChild}>
          Child
        </ToggleButton>
      </ToggleButtonGroup>
    </StackLayout>
  );
};

Collapsed.args = {
  parent,
  child,
};

export const ReducedMotion: StoryFn<typeof ParentChildLayout> = (args) => {
  const [currentView, setCurrentView] = useState<StackedViewElement>("parent");

  const handleParent = () => {
    setCurrentView("parent");
  };
  const handleChild = () => {
    setCurrentView("child");
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
        collapsedViewElement={currentView}
        collapseAtBreakpoint="md"
      />
      <ToggleButtonGroup defaultValue="parent">
        <ToggleButton value="parent" onClick={handleParent}>
          Parent
        </ToggleButton>
        <ToggleButton value="child" onClick={handleChild}>
          Child
        </ToggleButton>
      </ToggleButtonGroup>
    </StackLayout>
  );
};

ReducedMotion.args = {
  collapseAtBreakpoint: "xl",
  parent,
  child,
};

// Preferences layout

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
      <DropdownNext>
        {languages.map((lang) => (
          <Option value={lang} key={lang}>
            {lang}
          </Option>
        ))}
      </DropdownNext>
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
      <DropdownNext defaultSelected={["Password"]}>
        <Option value="Password" key="Password">
          Password
        </Option>
        <Option value="Soft token" key="Soft token">
          Soft token
        </Option>
        <Option value="Biometric" key="Biometric">
          Biometric
        </Option>
      </DropdownNext>
    </FormField>
  </StackLayout>
);

const exportView = () => (
  <StackLayout gap={1}>
    <FormField labelPlacement="left">
      <FormFieldLabel>File type</FormFieldLabel>
      <DropdownNext defaultSelected={["PNG"]}>
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
      </DropdownNext>
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Size</FormFieldLabel>
      <DropdownNext defaultSelected={["1x"]}>
        <Option value="1x" key="1x">
          1x
        </Option>
        <Option value="2x" key="2x">
          2x
        </Option>
        <Option value="3x" key="3x">
          3x
        </Option>
      </DropdownNext>
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Suffix</FormFieldLabel>
      <Input />
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Color profile</FormFieldLabel>
      <DropdownNext defaultSelected={["Same as current (sRGB)"]}>
        <Option value="Same as current (sRGB)" key="Same as current (sRGB)">
          Same as current (sRGB)
        </Option>
        <Option value="Display P3" key="Display P3">
          Display P3
        </Option>
      </DropdownNext>
    </FormField>
  </StackLayout>
);

export const PreferencesLayout: StoryFn<typeof ParentChildLayout> = (args) => {
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

  const [currentView, setCurrentView] = useState<
    StackedViewElement | undefined
  >();

  const showParent = () => {
    setCurrentView("parent");
  };
  const showChild = () => {
    setCurrentView("child");
  };

  const [active, setActive] = useState(items[0]);

  const parent = (
    <nav>
      <ul>
        {items.map((item) => (
          <li key={item.label}>
            <NavigationItem
              active={active.label === item.label}
              href="#"
              orientation="vertical"
              onClick={(event) => {
                // Prevent default to avoid navigation
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
    <FlexLayout direction="column" className="child">
      <FlexLayout gap={1}>
        {currentView === "child" && (
          <Button
            onClick={showParent}
            className="back-button"
            variant="secondary"
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

  return (
    <div className="parent-child-composite-container">
      <ParentChildLayout
        {...args}
        collapsedViewElement={currentView}
        parent={parent}
        child={child}
        onCollapseChange={(isCollapsed) => {
          if (!isCollapsed) setCurrentView(undefined);
        }}
      />
    </div>
  );
};

PreferencesLayout.args = {
  collapseAtBreakpoint: "sm",
};
