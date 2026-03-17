import {
  Button,
  Dropdown,
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  H2,
  Input,
  Option,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  Text,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import { ExportIcon, LaptopIcon, UserIcon } from "@salt-ds/icons";
import { InlaidPanel } from "@salt-ds/lab";

import type { Meta, StoryFn } from "@storybook/react-vite";
import { useState } from "react";

export default {
  title: "Lab/InlaidPanel",
  component: InlaidPanel,
  parameters: {
    layout: "fullscreen",
  },
} as Meta<typeof InlaidPanel>;

const FormFieldExample = () => (
  <FormField>
    <FormFieldLabel>Label</FormFieldLabel>
    <Input />
    <FormFieldHelperText>Help text appears here</FormFieldHelperText>
  </FormField>
);

export const Left: StoryFn = () => {
  const [open, setOpen] = useState(false);

  return (
    <FlexLayout
      style={{
        height: "100vh",
      }}
      gap={0}
    >
      <InlaidPanel
        open={open}
        aria-label="Sample form"
        style={
          {
            "--saltInlaidPanel-width": "500px",
          } as React.CSSProperties
        }
      >
        <StackLayout align="start" gap={1}>
          <Button onClick={() => setOpen(false)} style={{ marginLeft: "auto" }}>
            ✕ Close
          </Button>
          <H2>Section Title</H2>
          <Text>
            This placeholder text is provided to illustrate how content will
            appear within the component. The sentences are intended for
            demonstration only and do not convey specific information. Generic
            examples like this help review layout, spacing, and overall design.
            Adjust the wording as needed to fit your use case or display
            requirements.
          </Text>
          {Array.from({ length: 7 }, (_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Acceptable in this case since content is static and not re-orderable
            <FormFieldExample key={index} />
          ))}
        </StackLayout>
      </InlaidPanel>
      <FlexLayout gap={1} padding={1}>
        <Button onClick={() => setOpen(!open)}>Open Left Panel</Button>
        <Button>Button 1</Button>
        <Button>Button 2</Button>
        <Button>Button 3</Button>
      </FlexLayout>
    </FlexLayout>
  );
};

export const Right: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <FlexLayout
      style={{
        height: "100vh",
      }}
    >
      <FlexItem grow={1} padding={1}>
        <Button onClick={() => setOpen(!open)}>Open Right Panel</Button>
      </FlexItem>
      <InlaidPanel
        open={open}
        position="right"
        aria-label="Sample form"
        style={
          {
            "--saltInlaidPanel-width": "500px",
          } as React.CSSProperties
        }
      >
        <StackLayout align="start" gap={1}>
          <Button onClick={() => setOpen(false)} style={{ marginLeft: "auto" }}>
            ✕ Close
          </Button>
          <H2>Section Title</H2>
          <Text>
            This placeholder text is provided to illustrate how content will
            appear within the component. The sentences are intended for
            demonstration only and do not convey specific information. Generic
            examples like this help review layout, spacing, and overall design.
            Adjust the wording as needed to fit your use case or display
            requirements.
          </Text>
          {Array.from({ length: 7 }, (_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Acceptable in this case since content is static and not re-orderable
            <FormFieldExample key={index} />
          ))}
        </StackLayout>
      </InlaidPanel>
    </FlexLayout>
  );
};

export const Top: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <StackLayout gap={0}>
      <InlaidPanel
        open={open}
        position="top"
        aria-label="Sample form"
        style={{
          height: 280,
        }}
      >
        <StackLayout align="start">
          <Button
            onClick={() => setOpen(false)}
            style={{
              marginLeft: "auto",
            }}
          >
            ✕ Close
          </Button>
          <H2>Section title</H2>
          <Text>
            This placeholder text is provided to illustrate how content will
            appear within the component. The sentences are intended for
            demonstration only and do not convey specific information. Generic
            examples like this help review layout, spacing, and overall design.
            Adjust the wording as needed to fit your use case or display
            requirements.
          </Text>
          <FlexLayout>
            {Array.from({ length: 4 }, (_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Acceptable in this case since content is static and not re-orderable
              <FormFieldExample key={index} />
            ))}
          </FlexLayout>
        </StackLayout>
      </InlaidPanel>
      <FlexItem padding={1}>
        <Button onClick={() => setOpen(!open)}>Open top panel</Button>
      </FlexItem>
    </StackLayout>
  );
};

export const Bottom: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <StackLayout
      style={{
        height: "100vh",
      }}
      gap={0}
    >
      <FlexItem grow={1} padding={1}>
        <Button onClick={() => setOpen(!open)}>Open bottom panel</Button>
      </FlexItem>
      <InlaidPanel open={open} position="bottom" aria-label="Sample form">
        <StackLayout align="start">
          <Button
            onClick={() => setOpen(false)}
            style={{
              marginLeft: "auto",
            }}
          >
            ✕ Close
          </Button>
          <H2>Section title</H2>
          <Text>
            This placeholder text is provided to illustrate how content will
            appear within the component. The sentences are intended for
            demonstration only and do not convey specific information. Generic
            examples like this help review layout, spacing, and overall design.
            Adjust the wording as needed to fit your use case or display
            requirements.
          </Text>
          <FlexLayout>
            {Array.from({ length: 4 }, (_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Acceptable in this case since content is static and not re-orderable
              <FormFieldExample key={index} />
            ))}
          </FlexLayout>
        </StackLayout>
      </InlaidPanel>
    </StackLayout>
  );
};

export const ContentSwitching: StoryFn = () => {
  const [activeSetting, setActiveSetting] = useState<string | undefined>(
    undefined,
  );

  const open = activeSetting !== undefined;

  const items = [
    {
      label: "Display",
      icon: <LaptopIcon />,
      title: "Display settings",
      view: () => (
        <StackLayout gap={1}>
          <FormField labelPlacement="left">
            <FormFieldLabel>Language</FormFieldLabel>
            <Dropdown defaultSelected={["English"]}>
              <Option value="English" />
              <Option value="French" />
              <Option value="German" />
              <Option value="Italian" />
              <Option value="Spanish" />
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
        </StackLayout>
      ),
    },
    {
      label: "Account",
      icon: <UserIcon />,
      title: "Account settings",
      view: () => (
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
              <Option value="Password" />
              <Option value="Soft token" />
              <Option value="Biometric" />
            </Dropdown>
          </FormField>
        </StackLayout>
      ),
    },
    {
      label: "Export",
      icon: <ExportIcon />,
      title: "Export settings",
      view: () => (
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
      ),
    },
  ];

  const activeItem = items.find(
    (item) => item.label.toLowerCase() === activeSetting,
  );

  return (
    <FlexLayout
      style={{
        height: "100vh",
      }}
      gap={0}
    >
      <InlaidPanel
        open={open}
        position="left"
        aria-label="Sample form"
        style={
          {
            "--saltInlaidPanel-width": "500px",
          } as React.CSSProperties
        }
      >
        <StackLayout gap={1}>
          <Button
            onClick={() => setActiveSetting(undefined)}
            style={{ marginLeft: "auto" }}
          >
            ✕ Close
          </Button>
          {activeItem && (
            <>
              <H2>{activeItem.title}</H2>
              {activeItem.view()}
            </>
          )}
        </StackLayout>
      </InlaidPanel>
      <FlexLayout direction="column" gap={1} padding={1}>
        <Text>
          Click any button to open the panel or switch between different
          settings:
        </Text>
        <ToggleButtonGroup
          onChange={(event) => setActiveSetting(event.currentTarget.value)}
          value={activeSetting}
        >
          <ToggleButton value="display">
            <LaptopIcon /> Display Settings
          </ToggleButton>
          <ToggleButton value="account">
            <UserIcon /> Account Settings
          </ToggleButton>
          <ToggleButton value="export">
            <ExportIcon /> Export Settings
          </ToggleButton>
        </ToggleButtonGroup>
      </FlexLayout>
    </FlexLayout>
  );
};
