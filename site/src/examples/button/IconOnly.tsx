import { Button, FlowLayout, StackLayout, Tooltip } from "@salt-ds/core";
import { SearchIcon, SendIcon, SettingsIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const IconOnly = (): ReactElement => (
  <StackLayout gap={3}>
    <FlowLayout>
      <Tooltip placement="top" content="Send comment">
        <Button appearance="solid" color="accent">
          <SendIcon />
        </Button>
      </Tooltip>
      <Tooltip placement="top" content="Search document">
        <Button appearance="bordered" color="accent">
          <SearchIcon />
        </Button>
      </Tooltip>
      <Tooltip placement="top" content="Open settings">
        <Button appearance="transparent" color="accent">
          <SettingsIcon />
        </Button>
      </Tooltip>
    </FlowLayout>
    <FlowLayout>
      <Tooltip placement="top" content="Send comment">
        <Button appearance="solid" color="neutral">
          <SendIcon />
        </Button>
      </Tooltip>
      <Tooltip placement="top" content="Search document">
        <Button appearance="bordered" color="neutral">
          <SearchIcon />
        </Button>
      </Tooltip>
      <Tooltip placement="top" content="Open settings">
        <Button appearance="transparent" color="neutral">
          <SettingsIcon />
        </Button>
      </Tooltip>
    </FlowLayout>
  </StackLayout>
);
