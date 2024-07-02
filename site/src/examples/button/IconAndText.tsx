import { Button } from "@salt-ds/core";
import { RefreshIcon, SearchIcon, SendIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const IconAndText = (): ReactElement => (
  <>
    <Button variant="primary">
      <SearchIcon /> Search
    </Button>
    <Button variant="cta">
      Send <SendIcon />
    </Button>
    <Button variant="secondary">
      Refresh <RefreshIcon />
    </Button>
  </>
);
