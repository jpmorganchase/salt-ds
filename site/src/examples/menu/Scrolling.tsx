import { ReactElement } from "react";
import { Menu, MenuItem, MenuPanel, MenuTrigger } from "@salt-ds/lab";
import { Button } from "@salt-ds/core";
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
        {Array.from({ length: 20 }, (_, i) => (
          <MenuItem key={i}>Item {i}</MenuItem>
        ))}
      </MenuPanel>
    </Menu>
  );
};
