import { Button, FlowLayout, StackLayout, Tooltip } from "@salt-ds/core";
import { SearchIcon, SendIcon, SettingsIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const IconOnly = (): ReactElement => (
  <StackLayout gap={3}>
    <FlowLayout>
      <Tooltip placement="top" content="Send comment">
        <Button appearance="filled" chrome="accent">
          <SendIcon />
        </Button>
      </Tooltip>
      <Tooltip placement="top" content="Search document">
        <Button appearance="outlined" chrome="accent">
          <SearchIcon />
        </Button>
      </Tooltip>
      <Tooltip placement="top" content="Open settings">
        <Button appearance="minimal" chrome="accent">
          <SettingsIcon />
        </Button>
      </Tooltip>
    </FlowLayout>
    <FlowLayout>
      <Tooltip placement="top" content="Send comment">
        <Button appearance="filled" chrome="neutral">
          <SendIcon />
        </Button>
      </Tooltip>
      <Tooltip placement="top" content="Search document">
        <Button appearance="outlined" chrome="neutral">
          <SearchIcon />
        </Button>
      </Tooltip>
      <Tooltip placement="top" content="Open settings">
        <Button appearance="minimal" chrome="neutral">
          <SettingsIcon />
        </Button>
      </Tooltip>
    </FlowLayout>
  </StackLayout>
);
