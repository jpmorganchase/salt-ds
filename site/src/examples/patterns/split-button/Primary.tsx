import {
  Button,
  Menu,
  MenuItem,
  MenuPanel,
  MenuTrigger,
  SegmentedButtonGroup,
} from "@salt-ds/core";
import {
  CallIcon,
  ChatIcon,
  ChevronDownIcon,
  MessageIcon,
  PrintIcon,
  ShareIcon,
} from "@salt-ds/icons";

export const Primary = () => {
  return (
    <SegmentedButtonGroup>
      <Button>
        <ChatIcon aria-hidden />
        Message
      </Button>
      <Menu placement="bottom-end">
        <MenuTrigger>
          <Button aria-label="More message actions">
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
