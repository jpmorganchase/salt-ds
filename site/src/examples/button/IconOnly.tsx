import { Button, FlowLayout, StackLayout, Tooltip } from "@salt-ds/core";
import { PrintIcon, SearchIcon, ShareIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const IconOnly = (): ReactElement => (
  <StackLayout gap={3}>
    <FlowLayout>
      <Tooltip placement="top" content="Search document">
        <Button appearance="solid" sentiment="accented">
          <SearchIcon />
        </Button>
      </Tooltip>
      <Tooltip placement="top" content="Print document">
        <Button appearance="bordered" sentiment="accented">
          <PrintIcon />
        </Button>
      </Tooltip>
      <Tooltip placement="top" content="Share">
        <Button appearance="transparent" sentiment="accented">
          <ShareIcon />
        </Button>
      </Tooltip>
    </FlowLayout>
  </StackLayout>
);
