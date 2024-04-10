import { ReactElement } from "react";
import {
  Menu,
  MenuGroup,
  MenuItem,
  MenuPanel,
  MenuTrigger,
} from "@salt-ds/lab";
import { Button } from "@salt-ds/core";
import { MicroMenuIcon } from "@salt-ds/icons";

export const SeparatorOnly = (): ReactElement => {
  return (
    <Menu>
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
          <MenuItem>Export</MenuItem>
          <MenuItem>Settings</MenuItem>
        </MenuGroup>
      </MenuPanel>
    </Menu>
  );
};
