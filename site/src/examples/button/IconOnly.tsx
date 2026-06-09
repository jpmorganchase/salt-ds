import { Button, FlowLayout, Tooltip } from "@salt-ds/core";
import { PrintIcon, SearchIcon, ShareIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const IconOnly = (): ReactElement => (
  <FlowLayout>
    <Tooltip placement="top" content="Search document">
      <Button
        appearance="solid"
        sentiment="accented"
        aria-label="Search document"
      >
        <SearchIcon aria-hidden />
      </Button>
    </Tooltip>
    <Tooltip placement="top" content="Print document">
      <Button
        appearance="bordered"
        sentiment="accented"
        aria-label="Print document"
      >
        <PrintIcon aria-hidden />
      </Button>
    </Tooltip>
    <Tooltip placement="top" content="Share document">
      <Button
        appearance="transparent"
        sentiment="accented"
        aria-label="Share document"
      >
        <ShareIcon aria-hidden />
      </Button>
    </Tooltip>
  </FlowLayout>
);
