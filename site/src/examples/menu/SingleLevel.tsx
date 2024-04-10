import { ReactElement } from "react";
import { Menu, MenuItem, MenuPanel, MenuTrigger } from "@salt-ds/lab";
import { Button } from "@salt-ds/core";
import { MicroMenuIcon } from "@salt-ds/icons";

export const SingleLevel = (): ReactElement => {
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
