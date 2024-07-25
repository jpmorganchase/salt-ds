import { Button, GridLayout } from "@salt-ds/core";
import { SearchIcon, SendIcon, SettingsSolidIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const IconOnly = (): ReactElement => (
  <GridLayout columns={3}>
    <Button appearance="solid" color="neutral">
      <SendIcon />
    </Button>
    <Button appearance="outline" color="neutral">
      <SearchIcon />
    </Button>
    <Button appearance="transparent" color="neutral">
      <SettingsSolidIcon />
    </Button>
    <Button appearance="solid" color="accent">
      <SendIcon />
    </Button>
    <Button appearance="outline" color="accent">
      <SearchIcon />
    </Button>
    <Button appearance="transparent" color="accent">
      <SettingsSolidIcon />
    </Button>
  </GridLayout>
);
