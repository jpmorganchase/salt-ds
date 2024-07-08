import { Button, Menu, MenuItem, MenuPanel, MenuTrigger } from "@salt-ds/core";
import {
  CopyIcon,
  ExportIcon,
  MicroMenuIcon,
  SettingsIcon,
} from "@salt-ds/icons";
import type { ReactElement } from "react";

export const WithIcon = (): ReactElement => {
  return (
    <Menu>
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
