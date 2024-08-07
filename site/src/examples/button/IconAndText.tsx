import { Button, FlowLayout, StackLayout } from "@salt-ds/core";
import {
  DoubleChevronRightIcon,
  DownloadIcon,
  SearchIcon,
} from "@salt-ds/icons";
import type { ReactElement } from "react";

export const IconAndText = (): ReactElement => (
  <StackLayout gap={3}>
    <FlowLayout>
      <Button appearance="filled" chrome="accent">
        <SearchIcon /> Search
      </Button>
      <Button appearance="outlined" chrome="accent">
        <DownloadIcon /> Download
      </Button>
      <Button appearance="minimal" chrome="accent">
        Expand <DoubleChevronRightIcon />
      </Button>
    </FlowLayout>
    <FlowLayout>
      <Button appearance="filled" chrome="neutral">
        <SearchIcon /> Search
      </Button>
      <Button appearance="outlined" chrome="neutral">
        <DownloadIcon /> Download
      </Button>
      <Button appearance="minimal" chrome="neutral">
        Expand <DoubleChevronRightIcon />
      </Button>
    </FlowLayout>
  </StackLayout>
);
