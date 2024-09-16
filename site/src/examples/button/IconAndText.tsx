import { Button, FlowLayout, StackLayout } from "@salt-ds/core";
import {
  ChevronRightIcon,
  ExpandAllIcon,
  ExportIcon,
  PrintIcon,
  SendIcon,
  ShareIcon,
  UploadIcon,
} from "@salt-ds/icons";
import type { ReactElement } from "react";

export const IconAndText = (): ReactElement => (
  <StackLayout gap={3}>
    <FlowLayout>
      <Button appearance="solid" sentiment="accented">
        <UploadIcon aria-hidden /> Upload
      </Button>
      <Button appearance="bordered" sentiment="accented">
        <PrintIcon aria-hidden /> Print
      </Button>
      <Button appearance="transparent" sentiment="accented">
        <ShareIcon aria-hidden /> Share
      </Button>
    </FlowLayout>
    <FlowLayout>
      <Button appearance="solid" sentiment="accented">
        Open <ChevronRightIcon aria-hidden />
      </Button>
      <Button appearance="bordered" sentiment="accented">
        Expand All <ExpandAllIcon aria-hidden />
      </Button>
      <Button appearance="transparent" sentiment="accented">
        Send <SendIcon aria-hidden />
      </Button>
    </FlowLayout>
  </StackLayout>
);
