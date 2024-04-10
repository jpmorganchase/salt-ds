import { ReactElement } from "react";
import { Button, Tooltip, SegmentedButtonGroup } from "@salt-ds/core";
import { CallIcon, MessageIcon, ChatGroupIcon } from "@salt-ds/icons";

export const IconOnly = (): ReactElement => (
  <SegmentedButtonGroup>
    <Tooltip placement="top" content="Message">
      <Button aria-label="Message">
        <MessageIcon aria-hidden />
      </Button>
    </Tooltip>
    <Tooltip content="Chat" placement="top">
      <Button aria-label="Chat">
        <ChatGroupIcon aria-hidden />
      </Button>
    </Tooltip>
    <Tooltip content="Call" placement="top">
      <Button aria-label="Call">
        <CallIcon aria-hidden />
      </Button>
    </Tooltip>
  </SegmentedButtonGroup>
);
