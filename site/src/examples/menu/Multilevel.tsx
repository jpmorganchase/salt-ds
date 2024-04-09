import { ReactElement } from "react";
import { Menu, MenuItem, MenuPanel, MenuTrigger } from "@salt-ds/lab";
import { Button } from "@salt-ds/core";
import { MicroMenuIcon } from "@salt-ds/icons";

function EditStylingMenu() {
  return (
    <Menu>
      <MenuTrigger>
        <MenuItem>Edit styling</MenuItem>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem>Column</MenuItem>
        <MenuItem>Cell</MenuItem>
        <MenuItem>Row</MenuItem>
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
        <MenuItem>Column</MenuItem>
        <MenuItem>Cell</MenuItem>
        <MenuItem>Row</MenuItem>
      </MenuPanel>
    </Menu>
  );
}

export const Multilevel = (): ReactElement => {
  return (
    <Menu>
      <MenuTrigger>
        <Button variant="secondary" aria-label="Open Menu">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem>Copy</MenuItem>
        <EditStylingMenu />
        <ClearStylingMenu />
        <MenuItem>Export</MenuItem>
        <MenuItem>Settings</MenuItem>
      </MenuPanel>
    </Menu>
  );
};
