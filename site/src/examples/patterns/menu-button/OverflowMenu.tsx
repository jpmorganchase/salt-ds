import { Button, Menu, MenuItem, MenuPanel, MenuTrigger } from "@salt-ds/core";
import { MicroMenuIcon } from "@salt-ds/icons";

export const OverflowMenu = () => {
  return (
    <Menu>
      <MenuTrigger>
        <Button appearance="transparent" aria-label="More actions">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem>Aggregation</MenuItem>
        <MenuItem>Format</MenuItem>
        <MenuItem>View metadata</MenuItem>
      </MenuPanel>
    </Menu>
  );
};
