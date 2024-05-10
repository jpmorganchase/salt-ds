import { ReactElement } from "react";
import {
  Button,
  Menu,
  MenuItem,
  MenuPanel,
  MenuTrigger,
  SegmentedButtonGroup,
} from "@salt-ds/core";
import {
  CopyIcon,
  ExportIcon,
  MicroMenuIcon,
  SettingsIcon,
} from "@salt-ds/icons";

export const WithIcon = (): ReactElement => {
  return (
    <SegmentedButtonGroup>
      <Button>Button</Button>
      <Button>Button</Button>
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
    </SegmentedButtonGroup>
  );
};
