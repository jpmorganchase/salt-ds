import {
  Button,
  Menu,
  MenuItem,
  MenuPanel,
  MenuTrigger,
  StackLayout,
} from "@salt-ds/core";
import { ChevronDownIcon } from "@salt-ds/icons";

export const Placement = () => {
  return (
    <StackLayout direction="row">
      <Menu placement="bottom-start">
        <MenuTrigger>
          <Button>
            Bottom Start (default)
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

      <Menu placement="bottom-end">
        <MenuTrigger>
          <Button>
            Bottom end
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
      <Menu placement="top-start">
        <MenuTrigger>
          <Button>
            Top start
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
      <Menu placement="top-end">
        <MenuTrigger>
          <Button>
            Top end
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
    </StackLayout>
  );
};
