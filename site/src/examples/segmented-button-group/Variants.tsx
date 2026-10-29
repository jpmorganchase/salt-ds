import { Button, SegmentedButtonGroup, StackLayout } from "@salt-ds/core";
import { CallIcon, ChatGroupIcon, MessageIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const Variants = (): ReactElement => (
  <StackLayout>
    <SegmentedButtonGroup>
      <Button>
        <MessageIcon aria-hidden /> Message
      </Button>
      <Button>
        <ChatGroupIcon aria-hidden />
        Chat
      </Button>
      <Button>
        <CallIcon aria-hidden /> Call
      </Button>
    </SegmentedButtonGroup>
    <SegmentedButtonGroup>
      <Button appearance="transparent">
        <MessageIcon aria-hidden /> Message
      </Button>
      <Button appearance="transparent">
        <ChatGroupIcon aria-hidden /> Chat
      </Button>
      <Button appearance="transparent">
        <CallIcon aria-hidden /> Call
      </Button>
    </SegmentedButtonGroup>
    <SegmentedButtonGroup>
      <Button sentiment="accented">
        <MessageIcon aria-hidden /> Message
      </Button>
      <Button sentiment="accented">
        <ChatGroupIcon aria-hidden /> Chat
      </Button>
      <Button sentiment="accented">
        <CallIcon aria-hidden /> Call
      </Button>
    </SegmentedButtonGroup>
  </StackLayout>
);
