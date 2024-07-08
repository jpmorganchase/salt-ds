import { Button } from "@salt-ds/core";
import { SearchIcon, SendIcon, SettingsSolidIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const IconOnly = (): ReactElement => (
  <>
    <Button variant="cta">
      <SendIcon />
    </Button>
    <Button variant="primary">
      <SearchIcon />
    </Button>
    <Button variant="secondary">
      <SettingsSolidIcon />
    </Button>
  </>
);
