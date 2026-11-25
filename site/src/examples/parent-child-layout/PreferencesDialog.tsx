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
  Option,
  ParentChildLayout,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemLabel,
  VerticalNavigationItemTrigger,
} from "@salt-ds/core";
import {
  ChevronLeftIcon,
  ExportIcon,
  LaptopIcon,
  UserIcon,
} from "@salt-ds/icons";
import { useCallback, useRef, useState } from "react";

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
      icon: <LaptopIcon aria-hidden />,
      title: "Display settings",
      view: displayView,
    },
    {
      label: "Account",
      icon: <UserIcon aria-hidden />,
      title: "Account settings",
      view: accountView,
    },
    {
      label: "Export",
      icon: <ExportIcon aria-hidden />,
      title: "Export settings",
      view: exportView,
    },
  ];

  const [visibleView, setVisibleView] = useState<"child" | "parent">("child");
  const [active, setActive] = useState(items[0]);
  const [collapsed, setCollapsed] = useState<boolean>();
  const [open, setOpen] = useState<boolean>(false);
  const pendingFocus = useRef<"settings" | "category" | null>(null);

  // Move focus after an explicit collapsed-view navigation action mounts
  // its destination, without moving focus on ordinary renders or resizing.
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

  const showParent = () => {
    pendingFocus.current = "category";
    setVisibleView("parent");
  };
  const showChild = () => {
    pendingFocus.current = collapsed ? "settings" : null;
    setVisibleView("child");
  };

  const parent = (
    <VerticalNavigation
      aria-label="Preferences sections"
      appearance="indicator"
      className={styles.parentView}
    >
      {items.map((item) => (
        <VerticalNavigationItem
          key={item.label}
          active={active.label === item.label}
        >
          <VerticalNavigationItemContent>
            <VerticalNavigationItemTrigger
              ref={active.label === item.label ? focusCategory : undefined}
              render={<button type="button" />}
              onClick={() => {
                setActive(item);
                showChild();
              }}
            >
              {item.icon}
              <VerticalNavigationItemLabel>
                {item.label}
              </VerticalNavigationItemLabel>
            </VerticalNavigationItemTrigger>
          </VerticalNavigationItemContent>
        </VerticalNavigationItem>
      ))}
    </VerticalNavigation>
  );

  const child = (
    <FlexLayout direction="column" gap={0} className={styles.childView}>
      <FlexLayout gap={1}>
        {visibleView === "child" && collapsed && (
          <Button
            onClick={showParent}
            appearance="transparent"
            aria-label="Back"
          >
            <ChevronLeftIcon aria-hidden />
          </Button>
        )}
        <H2
          ref={focusSettings}
          tabIndex={-1}
          style={{ marginBottom: "var(--salt-spacing-200)" }}
        >
          {active.label}
        </H2>
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
        aria-label="Preferences"
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
