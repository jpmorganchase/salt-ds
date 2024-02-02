import { useState } from "react";
import {
  Button,
  FormField,
  FormFieldLabel,
  Input,
  NavigationItem,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
} from "@salt-ds/core";
import {
  DropdownNext,
  Option,
  ParentChildLayout,
  StackedViewElement,
} from "@salt-ds/lab";
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
      <RadioButtonGroup direction="horizontal" wrap={false}>
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
      <DropdownNext defaultValue={["Password"]}>
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
      <DropdownNext defaultValue={["PNG"]}>
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
      <DropdownNext defaultValue={["1x"]}>
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
      <DropdownNext defaultValue={["Same as current (sRGB)"]}>
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
    setCurrentView("parent");
  };
  const showChild = () => {
    setCurrentView("child");
  };

  const [active, setActive] = useState(items[0]);

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
    <div className={styles.child}>
      {currentView === "child" && (
        <Button
          onClick={showParent}
          className={styles["back-button"]}
          variant="secondary"
          aria-label="Back"
        >
          <ChevronLeftIcon />
        </Button>
      )}
      {active.view?.()}
    </div>
  );

  return (
    <div className={styles["parent-child-composite-container"]}>
      <ParentChildLayout
        collapsedViewElement={currentView}
        collapseAtBreakpoint="md"
        parent={parent}
        child={child}
        onCollapseChange={(isCollapsed) => {
          if (!isCollapsed) setCurrentView(undefined);
        }}
      />
    </div>
  );
};
