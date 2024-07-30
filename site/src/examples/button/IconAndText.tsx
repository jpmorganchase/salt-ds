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
        <Button appearance="solid" color="accent">
          <SearchIcon /> Search
        </Button>
        <Button appearance="outline" color="accent">
          <DownloadIcon /> Download
        </Button>
        <Button appearance="transparent" color="accent">
          Expand <DoubleChevronRightIcon />
        </Button>
      </FlowLayout>
      <FlowLayout>
        <Button appearance="solid" color="neutral">
          <SearchIcon /> Search
        </Button>
        <Button appearance="outline" color="neutral">
          <DownloadIcon /> Download
        </Button>
        <Button appearance="transparent" color="neutral">
          Expand <DoubleChevronRightIcon />
        </Button>
      </FlowLayout>
  </StackLayout>
);
