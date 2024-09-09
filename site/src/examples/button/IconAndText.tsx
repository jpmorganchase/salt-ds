import { Button, FlowLayout, StackLayout } from "@salt-ds/core";
import {
  ChevronRightIcon,
  ExpandAllIcon,
  ExportIcon,
  PrintIcon,
  ShareIcon,
  UploadIcon,
} from "@salt-ds/icons";
import type { ReactElement } from "react";

export const IconAndText = (): ReactElement => (
  <StackLayout gap={3}>
    <FlowLayout>
      <Button appearance="solid" sentiment="accented">
        <UploadIcon /> Upload
      </Button>
      <Button appearance="bordered" sentiment="accented">
        <PrintIcon /> Print
      </Button>
      <Button appearance="transparent" sentiment="accented">
        <ShareIcon /> Share
      </Button>
    </FlowLayout>
    <FlowLayout>
      <Button appearance="solid" sentiment="accented">
        Open <ChevronRightIcon />
      </Button>
      <Button appearance="bordered" sentiment="accented">
        Expand All <ExpandAllIcon />
      </Button>
      <Button appearance="transparent" sentiment="accented">
        Export <ExportIcon />
      </Button>
    </FlowLayout>
  </StackLayout>
);
