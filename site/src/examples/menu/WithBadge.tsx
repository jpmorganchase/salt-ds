import {
  Badge,
  Button,
  Menu,
  MenuItem,
  MenuPanel,
  MenuTrigger,
} from "@salt-ds/core";
import {
  CopyIcon,
  ExportIcon,
  MicroMenuIcon,
  SettingsIcon,
} from "@salt-ds/icons";
import type { ReactElement } from "react";

export const WithBadge = (): ReactElement => {
  return (
    <Menu>
      <MenuTrigger>
        <Button appearance="transparent" aria-label="Open Menu">
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
          <Badge
            style={{ marginLeft: "auto" }}
            value={3}
            aria-label="3 updates"
          />
        </MenuItem>
      </MenuPanel>
    </Menu>
  );
};
