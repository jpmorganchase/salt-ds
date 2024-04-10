import { Button, SegmentedButtonGroup } from "@salt-ds/core";
import {
  Menu,
  MenuGroup,
  MenuItem,
  MenuPanel,
  MenuTrigger,
} from "@salt-ds/lab";

import { Meta, StoryFn } from "@storybook/react";
import {
  ChevronDownIcon,
  CopyIcon,
  ExportIcon,
  MicroMenuIcon,
  PasteIcon,
  SettingsIcon,
} from "@salt-ds/icons";

export default {
  title: "Lab/Menu",
  component: Menu,
} as Meta<typeof Menu>;

export const SingleLevel: StoryFn<typeof Menu> = (args) => {
  return (
    <Menu {...args}>
      <MenuTrigger>
        <Button variant="secondary" aria-label="Open Menu">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem
          onClick={() => {
            alert("Copy");
          }}
        >
          Copy
        </MenuItem>
        <MenuItem
          onClick={() => {
            alert("Paste");
          }}
        >
          Paste
        </MenuItem>
        <MenuItem
          onClick={() => {
            alert("Export");
          }}
        >
          Export
        </MenuItem>
        <MenuItem
          onClick={() => {
            alert("Settings");
          }}
        >
          Settings
        </MenuItem>
      </MenuPanel>
    </Menu>
  );
};

function EditStylingMenu() {
  return (
    <Menu>
      <MenuTrigger>
        <MenuItem>Edit styling</MenuItem>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem
          onClick={() => {
            alert("Column");
          }}
        >
          Column
        </MenuItem>
        <MenuItem
          onClick={() => {
            alert("Cell");
          }}
        >
          Cell
        </MenuItem>
        <MenuItem
          onClick={() => {
            alert("Row");
          }}
        >
          Row
        </MenuItem>
      </MenuPanel>
    </Menu>
  );
}

function ClearStylingMenu() {
  return (
    <Menu>
      <MenuTrigger>
        <MenuItem>Clear styling</MenuItem>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem
          onClick={() => {
            alert("Column");
          }}
        >
          Column
        </MenuItem>
        <MenuItem
          onClick={() => {
            alert("Cell");
          }}
        >
          Cell
        </MenuItem>
        <MenuItem
          onClick={() => {
            alert("Row");
          }}
        >
          Row
        </MenuItem>
      </MenuPanel>
    </Menu>
  );
}

export const MultiLevel: StoryFn<typeof Menu> = (args) => {
  return (
    <Menu {...args}>
      <MenuTrigger>
        <Button variant="secondary" aria-label="Open Menu">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem
          onClick={() => {
            alert("Copy");
          }}
        >
          Copy
        </MenuItem>
        <EditStylingMenu />
        <ClearStylingMenu />
        <MenuItem
          onClick={() => {
            alert("Export");
          }}
        >
          Export
        </MenuItem>
        <MenuItem
          onClick={() => {
            alert("Settings");
          }}
        >
          Settings
        </MenuItem>
      </MenuPanel>
    </Menu>
  );
};

export const GroupedItems: StoryFn<typeof Menu> = (args) => {
  return (
    <Menu {...args}>
      <MenuTrigger>
        <Button variant="secondary" aria-label="Open Menu">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuGroup label="Actions">
          <MenuItem>Copy</MenuItem>
          <MenuItem>Paste</MenuItem>
        </MenuGroup>
        <MenuGroup label="Styling">
          <EditStylingMenu />
          <ClearStylingMenu />
        </MenuGroup>
        <MenuGroup label="Configurations">
          <MenuItem>Export</MenuItem>
          <MenuItem>Settings</MenuItem>
        </MenuGroup>
      </MenuPanel>
    </Menu>
  );
};

export const SeparatorOnly: StoryFn<typeof Menu> = (args) => {
  return (
    <Menu {...args}>
      <MenuTrigger>
        <Button variant="secondary" aria-label="Open Menu">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuGroup>
          <MenuItem>Copy</MenuItem>
          <MenuItem>Paste</MenuItem>
        </MenuGroup>
        <MenuGroup>
          <EditStylingMenu />
          <ClearStylingMenu />
        </MenuGroup>
        <MenuGroup>
          <MenuItem>Export</MenuItem>
          <MenuItem>Settings</MenuItem>
        </MenuGroup>
      </MenuPanel>
    </Menu>
  );
};

export const Icons: StoryFn<typeof Menu> = (args) => {
  return (
    <Menu {...args}>
      <MenuTrigger>
        <Button variant="secondary" aria-label="Open Menu">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem>
          <CopyIcon aria-hidden />
          Copy
        </MenuItem>
        <MenuItem>
          <ExportIcon aria-hidden />
          Export
        </MenuItem>
        <MenuItem>
          <SettingsIcon aria-hidden />
          Settings
        </MenuItem>
      </MenuPanel>
    </Menu>
  );
};

export const IconWithGroups: StoryFn<typeof Menu> = (args) => {
  return (
    <Menu {...args}>
      <MenuTrigger>
        <Button variant="secondary" aria-label="Open Menu">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuGroup>
          <MenuItem>
            <CopyIcon aria-hidden />
            Copy
          </MenuItem>
          <MenuItem disabled>
            <PasteIcon aria-hidden />
            Paste
          </MenuItem>
        </MenuGroup>
        <MenuGroup label="Styling">
          <EditStylingMenu />
          <ClearStylingMenu />
        </MenuGroup>
        <MenuGroup label="Configurations">
          <MenuItem>
            <ExportIcon aria-hidden />
            Export
          </MenuItem>
          <MenuItem>
            <SettingsIcon aria-hidden />
            Settings
          </MenuItem>
        </MenuGroup>
      </MenuPanel>
    </Menu>
  );
};

export const SplitButton: StoryFn = () => {
  return (
    <SegmentedButtonGroup>
      <Button variant="cta">Edit</Button>
      <Menu placement="bottom-end">
        <MenuTrigger>
          <Button variant="cta">
            <ChevronDownIcon aria-hidden />
          </Button>
        </MenuTrigger>
        <MenuPanel>
          <MenuItem>Copy</MenuItem>
          <MenuItem>Move</MenuItem>
          <MenuItem>Delete</MenuItem>
        </MenuPanel>
      </Menu>
    </SegmentedButtonGroup>
  );
};
