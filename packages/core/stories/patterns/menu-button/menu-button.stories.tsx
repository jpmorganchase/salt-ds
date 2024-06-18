import {
  StackLayout,
  Display2,
  Menu,
  MenuItem,
  MenuPanel,
  MenuTrigger,
  Button,
} from "@salt-ds/core";
import {
  MicroMenuIcon,
  ChevronDownIcon,
  SaveIcon,
  ExportIcon,
  DeleteIcon,
  SettingsIcon,
} from "@salt-ds/icons";
import { Meta } from "@storybook/react";

export default {
  title: "Patterns/Menu Button",
} as Meta;

export const MenuButton = () => {
  return (
    <Menu>
      <MenuTrigger>
        <Button aria-label="Open Menu">
          Create
          <ChevronDownIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem>Universe</MenuItem>
        <MenuItem>Attribute list</MenuItem>
        <MenuItem>Hierarchy</MenuItem>
        <MenuItem>Schedule</MenuItem>
        <MenuItem>Delivery</MenuItem>
      </MenuPanel>
    </Menu>
  );
};

export const WithIcons = () => {
  return (
    <Menu>
      <MenuTrigger>
        <Button aria-label="Open Menu">
          Actions
          <ChevronDownIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem>
          <SaveIcon aria-hidden />
          Save
        </MenuItem>
        <MenuItem>
          <SaveIcon aria-hidden />
          Save as
        </MenuItem>
        <MenuItem>
          <ExportIcon aria-hidden />
          Export
        </MenuItem>
        <MenuItem>
          <DeleteIcon aria-hidden />
          Delete
        </MenuItem>
      </MenuPanel>
    </Menu>
  );
};

export const Placement = () => {
  return (
    <StackLayout direction="row">
      <Menu placement="bottom-start">
        <MenuTrigger>
          <Button aria-label="Open Menu">
            Bottom Start (default)
            <ChevronDownIcon aria-hidden />
          </Button>
        </MenuTrigger>
        <MenuPanel>
          <MenuItem>Universe</MenuItem>
          <MenuItem>Attribute list</MenuItem>
          <MenuItem>Hierarchy</MenuItem>
          <MenuItem>Schedule</MenuItem>
          <MenuItem>Delivery</MenuItem>
        </MenuPanel>
      </Menu>

      <Menu placement="bottom-end">
        <MenuTrigger>
          <Button aria-label="Open Menu">
            Bottom end
            <ChevronDownIcon aria-hidden />
          </Button>
        </MenuTrigger>
        <MenuPanel>
          <MenuItem>Universe</MenuItem>
          <MenuItem>Attribute list</MenuItem>
          <MenuItem>Hierarchy</MenuItem>
          <MenuItem>Schedule</MenuItem>
          <MenuItem>Delivery</MenuItem>
        </MenuPanel>
      </Menu>
      <Menu placement="top-start">
        <MenuTrigger>
          <Button aria-label="Open Menu">
            Top start
            <ChevronDownIcon aria-hidden />
          </Button>
        </MenuTrigger>
        <MenuPanel>
          <MenuItem>Universe</MenuItem>
          <MenuItem>Attribute list</MenuItem>
          <MenuItem>Hierarchy</MenuItem>
          <MenuItem>Schedule</MenuItem>
          <MenuItem>Delivery</MenuItem>
        </MenuPanel>
      </Menu>
      <Menu placement="top-end">
        <MenuTrigger>
          <Button aria-label="Open Menu">
            Top end
            <ChevronDownIcon aria-hidden />
          </Button>
        </MenuTrigger>
        <MenuPanel>
          <MenuItem>Universe</MenuItem>
          <MenuItem>Attribute list</MenuItem>
          <MenuItem>Hierarchy</MenuItem>
          <MenuItem>Schedule</MenuItem>
          <MenuItem>Delivery</MenuItem>
        </MenuPanel>
      </Menu>
    </StackLayout>
  );
};

export const OverflowMenu = () => {
  return (
    <Menu>
      <MenuTrigger>
        <Button variant="secondary" aria-label="Open Menu">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem>Aggregation</MenuItem>
        <MenuItem>Format</MenuItem>
        <MenuItem>View metadata</MenuItem>
      </MenuPanel>
    </Menu>
  );
};

export const IconOnly = () => {
  return (
    <Menu>
      <MenuTrigger>
        <Button aria-label="Open Menu">
          <SettingsIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem>Privacy and security</MenuItem>
        <MenuItem>Performance</MenuItem>
        <MenuItem>Languages</MenuItem>
        <MenuItem>Downloads</MenuItem>
      </MenuPanel>
    </Menu>
  );
};

export const Heading = () => {
  return (
    <StackLayout direction="row" align="center" gap={1}>
      <Display2>Attribution</Display2>
      <Menu>
        <MenuTrigger>
          <Button aria-label="Open Menu" variant="secondary">
            <ChevronDownIcon aria-hidden />
          </Button>
        </MenuTrigger>
        <MenuPanel>
          <MenuItem>Time series</MenuItem>
          <MenuItem>Attribution</MenuItem>
          <MenuItem>Composition</MenuItem>
        </MenuPanel>
      </Menu>
    </StackLayout>
  );
};
