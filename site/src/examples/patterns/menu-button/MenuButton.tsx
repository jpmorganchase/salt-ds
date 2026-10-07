import { Button, Menu, MenuItem, MenuPanel, MenuTrigger } from "@salt-ds/core";
import { ChevronDownIcon } from "@salt-ds/icons";

export const MenuButton = () => {
  return (
    <Menu>
      <MenuTrigger>
        <Button>
          Create
          <ChevronDownIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem>Universe</MenuItem>
        <MenuItem>Attribute list</MenuItem>
        <MenuItem>Hierarchy</MenuItem>
        <MenuItem>Schedule</MenuItem>
        <MenuItem>Delivery</MenuItem>
      </MenuPanel>
    </Menu>
  );
};
