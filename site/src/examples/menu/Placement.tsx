import { ReactElement } from "react";
import { Button, Menu, MenuItem, MenuPanel, MenuTrigger } from "@salt-ds/core";
import { MicroMenuIcon } from "@salt-ds/icons";

export const Placement = (): ReactElement => {
  return (
    <Menu placement="right">
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
