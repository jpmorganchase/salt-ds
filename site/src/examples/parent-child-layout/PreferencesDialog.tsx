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
  NavigationItem,
  Option,
  ParentChildLayout,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
} from "@salt-ds/core";
import {
  ChevronLeftIcon,
  ExportIcon,
  LaptopIcon,
  UserIcon,
} from "@salt-ds/icons";
import { useState } from "react";

import styles from "./PreferencesDialog.module.css";

const languages = [
  "English",
  "French",
  "German",
  "Italian",
  "Spanish",
  "Turkish",
  "Ukrainian",
];

const displayView = () => (
  <StackLayout gap={1}>
    <FormField labelPlacement="left">
      <FormFieldLabel>Language</FormFieldLabel>
      <Dropdown>
        {languages.map((lang) => (
          <Option value={lang} key={lang} />
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
        <Option value="Password" key="Password" />
        <Option value="Soft token" key="Soft token" />
        <Option value="Biometric" key="Biometric" />
      </Dropdown>
    </FormField>
  </StackLayout>
);

const exportView = () => (
  <StackLayout gap={1}>
    <FormField labelPlacement="left">
      <FormFieldLabel>File type</FormFieldLabel>
      <Dropdown defaultSelected={["PNG"]}>
        <Option value="JPG" />
        <Option value="PDF" />
        <Option value="PNG" />
        <Option value="SVG" />
      </Dropdown>
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Size</FormFieldLabel>
      <Dropdown defaultSelected={["1x"]}>
        <Option value="1x" />
        <Option value="2x" />
        <Option value="3x" />
      </Dropdown>
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Suffix</FormFieldLabel>
      <Input />
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Color profile</FormFieldLabel>
      <Dropdown defaultSelected={["Same as current (sRGB)"]}>
        <Option value="Same as current (sRGB)" />
        <Option value="Display P3" />
      </Dropdown>
    </FormField>
  </StackLayout>
);

export const PreferencesDialog = () => {
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

  const [visibleView, setVisibleView] = useState<"child" | "parent">("child");

  const showParent = () => {
    setVisibleView("parent");
  };
  const showChild = () => {
    setVisibleView("child");
  };

  const [active, setActive] = useState(items[0]);
  const [collapsed, setCollapsed] = useState<boolean>();
  const [open, setOpen] = useState<boolean>(false);

  const parent = (
    <nav className={styles.parentView}>
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
    <FlexLayout direction="column" className={styles.childView}>
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
      <Dialog
        size={"medium"}
        open={open}
        onOpenChange={onOpenChange}
        className={styles.dialog}
      >
        <DialogCloseButton onClick={handleClose} />
        <DialogContent>
          <ParentChildLayout
            gap={1}
            visibleView={visibleView}
            parent={parent}
            child={child}
            onCollapseChange={handleCollapsed}
            className={styles.container}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
