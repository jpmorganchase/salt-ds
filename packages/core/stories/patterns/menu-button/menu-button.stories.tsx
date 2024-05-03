import {
  StackLayout,
  Text,
  Display1,
  Display2,
  Display3,
  Link,
  Menu,
  MenuItem,
  MenuPanel,
  MenuTrigger,
  Button,
  MenuGroup,
  Input,
  FormField,
} from "@salt-ds/core";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  MicroMenuIcon,
  ChevronDownIcon,
  UserIcon,
  UserSolidIcon,
} from "@salt-ds/icons";
import { Meta } from "@storybook/react";

export default {
  title: "Patterns/Menu Button",
} as Meta;

export const Regular = () => {
  return (
    <Menu>
      <MenuTrigger>
        <Button aria-label="Open Menu">
          <StackLayout direction="row" gap={1}>
            <UserSolidIcon aria-hidden />
            <ChevronDownIcon aria-hidden />
          </StackLayout>
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem>Copy</MenuItem>
        <MenuItem>Paste</MenuItem>
        <MenuItem>Export</MenuItem>
        <MenuItem>Settings</MenuItem>
      </MenuPanel>
    </Menu>
  );
};

export const Secondary = () => {
  return (
    <Menu>
      <MenuTrigger>
        <Button variant="secondary" aria-label="Open Menu">
          <StackLayout direction="row" gap={1}>
            <UserSolidIcon aria-hidden />
            <ChevronDownIcon aria-hidden />
          </StackLayout>
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem>Copy</MenuItem>
        <MenuItem>Paste</MenuItem>
        <MenuItem>Export</MenuItem>
        <MenuItem>Settings</MenuItem>
      </MenuPanel>
    </Menu>
  );
};

export const TriggerText = () => {
  return (
    <Menu>
      <MenuTrigger>
        <Button variant="secondary" aria-label="Open Menu">
          <StackLayout direction="row" gap={1}>
            Trigger text
            <ChevronDownIcon aria-hidden />
          </StackLayout>
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem>Copy</MenuItem>
        <MenuItem>Paste</MenuItem>
        <MenuItem>Export</MenuItem>
        <MenuItem>Settings</MenuItem>
      </MenuPanel>
    </Menu>
  );
};
export const IconOnly = () => {
  return (
    <Menu>
      <MenuTrigger>
        <Button variant="secondary" aria-label="Open Menu">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem>Copy</MenuItem>
        <MenuItem>Paste</MenuItem>
        <MenuItem>Export</MenuItem>
        <MenuItem>Settings</MenuItem>
      </MenuPanel>
    </Menu>
  );
};
