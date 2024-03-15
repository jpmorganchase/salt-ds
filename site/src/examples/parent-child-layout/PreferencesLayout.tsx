import { useState } from "react";
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
  DropdownNext,
  Option,
} from "@salt-ds/core";
import { ParentChildLayout, StackedViewElement } from "@salt-ds/lab";
import {
  ChevronLeftIcon,
  ExportIcon,
  LaptopIcon,
  UserIcon,
} from "@salt-ds/icons";

import styles from "./PreferencesLayout.module.css";

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
          <Option value={lang} key={lang} />
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
        <Option value="Password" key="Password" />
        <Option value="Soft token" key="Soft token" />
        <Option value="Biometric" key="Biometric" />
      </DropdownNext>
    </FormField>
  </StackLayout>
);

const exportView = () => (
  <StackLayout gap={1}>
    <FormField labelPlacement="left">
      <FormFieldLabel>File type</FormFieldLabel>
      <DropdownNext defaultSelected={["PNG"]}>
        <Option value="JPG" />
        <Option value="PDF" />
        <Option value="PNG" />
        <Option value="SVG" />
      </DropdownNext>
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Size</FormFieldLabel>
      <DropdownNext defaultSelected={["1x"]}>
        <Option value="1x" />
        <Option value="2x" />
        <Option value="3x" />
      </DropdownNext>
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Suffix</FormFieldLabel>
      <Input />
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Color profile</FormFieldLabel>
      <DropdownNext defaultSelected={["Same as current (sRGB)"]}>
        <Option value="Same as current (sRGB)" />
        <Option value="Display P3" />
      </DropdownNext>
    </FormField>
  </StackLayout>
);

export const PreferencesLayout = () => {
  const items = [
    {
      label: "Display",
      icon: <LaptopIcon />,
      title: "Display settings",
      view: displayView,
    },
    {
      label: "Account",
      icon: <UserIcon />,
      title: "Account settings",
      view: accountView,
    },
    {
      label: "Export",
      icon: <ExportIcon />,
      title: "Export settings",
      view: exportView,
    },
  ];

  const [currentView, setCurrentView] = useState<
    StackedViewElement | undefined
  >();

  const showParent = () => {
    collapsed && setCurrentView("parent");
  };
  const showChild = () => {
    collapsed && setCurrentView("child");
  };

  const [active, setActive] = useState(items[0]);
  const [collapsed, setCollapsed] = useState<boolean>();

  const parent = (
    <nav className={styles.navigation}>
      <ul className={styles.navList}>
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
    <FlexLayout direction="column" className={styles.child}>
      <FlexLayout gap={1}>
        {currentView === "child" && (
          <Button onClick={showParent} variant="secondary" aria-label="Back">
            <ChevronLeftIcon />
          </Button>
        )}
        <H2>{active.label}</H2>
      </FlexLayout>
      {active.view?.()}
    </FlexLayout>
  );

  const handleCollapsed = (isCollapsed: boolean) => {
    if (!isCollapsed) setCurrentView(undefined);
    setCollapsed(isCollapsed);
  };

  return (
    <div className={styles["parent-child-composite-container"]}>
      <ParentChildLayout
        collapsedViewElement={currentView}
        collapseAtBreakpoint="lg"
        parent={parent}
        child={child}
        onCollapseChange={handleCollapsed}
      />
    </div>
  );
};
