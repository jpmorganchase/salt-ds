import { Button, Text } from "@salt-ds/core";
import { Menu, MenuItem, MenuPanel, MenuTrigger } from "@salt-ds/lab";

import { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Lab/Menu",
  component: Menu,
} as Meta<typeof Menu>;

export const Default = () => {
  return (
    <Menu>
      <MenuTrigger>
        <Button>Click</Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem>One</MenuItem>
        <MenuItem>Two</MenuItem>
        <MenuItem>Three</MenuItem>
        <MenuItem>Four</MenuItem>
      </MenuPanel>
    </Menu>
  );
};

function Submenu() {
  return (
    <Menu>
      <MenuTrigger>
        <MenuItem>Four</MenuItem>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem>One</MenuItem>
        <MenuItem>Two</MenuItem>
        <MenuItem>Three</MenuItem>
        <Submenu />
      </MenuPanel>
    </Menu>
  );
}

export const Nested = () => {
  return (
    <Menu>
      <MenuTrigger>
        <Button>Click</Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem>One</MenuItem>
        <MenuItem>Two</MenuItem>
        <MenuItem>Three</MenuItem>
        <Submenu />
      </MenuPanel>
    </Menu>
  );
};
