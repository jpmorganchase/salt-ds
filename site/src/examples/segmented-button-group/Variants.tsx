import { Button, SegmentedButtonGroup, StackLayout } from "@salt-ds/core";
import { CallIcon, ChatGroupIcon, MessageIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const Variants = (): ReactElement => (
  <StackLayout>
    <SegmentedButtonGroup>
      <Button>
        <MessageIcon /> Message
      </Button>
      <Button>
        <ChatGroupIcon />
        Chat
      </Button>
      <Button>
        <CallIcon /> Call
      </Button>
    </SegmentedButtonGroup>
    <SegmentedButtonGroup>
      <Button appearance="transparent">
        <MessageIcon /> Message
      </Button>
      <Button appearance="transparent">
        <ChatGroupIcon /> Chat
      </Button>
      <Button appearance="transparent">
        <CallIcon /> Call
      </Button>
    </SegmentedButtonGroup>
    <SegmentedButtonGroup>
      <Button sentiment="accented">
        <MessageIcon /> Message
      </Button>
      <Button sentiment="accented">
        <ChatGroupIcon /> Chat
      </Button>
      <Button sentiment="accented">
        <CallIcon /> Call
      </Button>
    </SegmentedButtonGroup>
  </StackLayout>
);
