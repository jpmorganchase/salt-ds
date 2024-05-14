import {
  Button,
  Menu,
  MenuItem,
  MenuPanel,
  MenuTrigger,
  SegmentedButtonGroup,
} from "@salt-ds/core";
import {
  PrintIcon,
  MessageIcon,
  CallIcon,
  ShareIcon,
  ChevronDownIcon,
  ChatIcon,
} from "@salt-ds/icons";
import { Meta } from "@storybook/react";

export default {
  title: "Patterns/Split Button",
} as Meta;

export const Primary = () => {
  return (
    <SegmentedButtonGroup>
      <Button>
        <ChatIcon aria-hidden />
        Message
      </Button>
      <Menu placement="bottom-end">
        <MenuTrigger>
          <Button aria-label="Open Menu">
            <ChevronDownIcon aria-hidden />
          </Button>
        </MenuTrigger>
        <MenuPanel>
          <MenuItem>
            <MessageIcon aria-hidden />
            Email
          </MenuItem>
          <MenuItem>
            <CallIcon aria-hidden />
            Call
          </MenuItem>
          <MenuItem>
            <PrintIcon aria-hidden />
            Print
          </MenuItem>
          <MenuItem>
            <ShareIcon aria-hidden />
            Share
          </MenuItem>
        </MenuPanel>
      </Menu>
    </SegmentedButtonGroup>
  );
};
