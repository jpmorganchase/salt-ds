import {
  Button,
  Display2,
  Menu,
  MenuItem,
  MenuPanel,
  MenuTrigger,
  StackLayout,
} from "@salt-ds/core";
import { ChevronDownIcon } from "@salt-ds/icons";

export const Heading = () => {
  return (
    <StackLayout direction="row" align="center" gap={1}>
      <Display2>Attribution</Display2>
      <Menu>
        <MenuTrigger>
          <Button aria-label="Attribution actions" appearance="transparent">
            <ChevronDownIcon aria-hidden />
          </Button>
        </MenuTrigger>
        <MenuPanel>
          <MenuItem>Time series</MenuItem>
          <MenuItem>Attribution</MenuItem>
          <MenuItem>Composition</MenuItem>
        </MenuPanel>
      </Menu>
    </StackLayout>
  );
};
