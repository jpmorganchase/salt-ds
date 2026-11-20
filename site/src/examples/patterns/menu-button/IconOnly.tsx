import { Button, Menu, MenuItem, MenuPanel, MenuTrigger } from "@salt-ds/core";
import { SettingsIcon } from "@salt-ds/icons";

export const IconOnly = () => {
  return (
    <Menu>
      <MenuTrigger>
        <Button aria-label="Settings">
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
