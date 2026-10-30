import {
  Button,
  Menu,
  MenuItem,
  MenuPanel,
  MenuTrigger,
  SegmentedButtonGroup,
  Tooltip,
} from "@salt-ds/core";
import { ArrowLeftIcon, ChevronDownIcon } from "@salt-ds/icons";

export const IconOnly = () => {
  return (
    <SegmentedButtonGroup>
      <Tooltip content="Previous">
        <Button aria-label="previous">
          <ArrowLeftIcon aria-hidden />
        </Button>
      </Tooltip>
      <Menu placement="bottom-end">
        <MenuTrigger>
          <Button aria-label="Previous options">
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
