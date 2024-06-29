import { Button, SegmentedButtonGroup, Tooltip } from "@salt-ds/core";
import { CallIcon, ChatGroupIcon, MessageIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

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
