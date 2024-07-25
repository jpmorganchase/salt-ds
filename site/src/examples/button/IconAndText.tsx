import { Button, GridLayout } from "@salt-ds/core";
import { RefreshIcon, SearchIcon, SendIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const IconAndText = (): ReactElement => (
  <GridLayout columns={3}>
    <Button appearance="solid" color="neutral">
      <SearchIcon /> Search
    </Button>
    <Button appearance="outline" color="neutral">
      Send <SendIcon />
    </Button>
    <Button appearance="transparent" color="neutral">
      Refresh <RefreshIcon />
    </Button>
    <Button appearance="solid" color="accent">
      <SearchIcon /> Search
    </Button>
    <Button appearance="outline" color="accent">
      Send <SendIcon />
    </Button>
    <Button appearance="transparent" color="accent">
      Refresh <RefreshIcon />
    </Button>
  </GridLayout>
);
