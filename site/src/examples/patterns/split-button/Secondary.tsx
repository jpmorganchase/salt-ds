import {
  Button,
  Menu,
  MenuItem,
  MenuPanel,
  MenuTrigger,
  SegmentedButtonGroup,
} from "@salt-ds/core";
import { ChevronDownIcon } from "@salt-ds/icons";

export const Secondary = () => {
  return (
    <SegmentedButtonGroup>
      <Button appearance="transparent">Action</Button>
      <Menu placement="bottom-end">
        <MenuTrigger>
          <Button appearance="transparent" aria-label="More actions">
            <ChevronDownIcon aria-hidden />
          </Button>
        </MenuTrigger>
        <MenuPanel>
          <MenuItem>Action 2</MenuItem>
          <MenuItem>Action 3</MenuItem>
          <MenuItem>Action 4</MenuItem>
          <MenuItem>Action 5</MenuItem>
        </MenuPanel>
      </Menu>
    </SegmentedButtonGroup>
  );
};
