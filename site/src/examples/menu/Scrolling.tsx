import { ReactElement } from "react";
import { Button, Menu, MenuItem, MenuPanel, MenuTrigger } from "@salt-ds/core";
import { MicroMenuIcon } from "@salt-ds/icons";

export const Scrolling = (): ReactElement => {
  return (
    <Menu>
      <MenuTrigger>
        <Button variant="secondary" aria-label="Open Menu">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        {Array.from({ length: 30 }, (_, i) => (
          <MenuItem key={i}>Item {i + 1}</MenuItem>
        ))}
      </MenuPanel>
    </Menu>
  );
};
