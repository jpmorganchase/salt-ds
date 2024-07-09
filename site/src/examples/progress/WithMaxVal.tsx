import {
  CircularProgress,
  FlexItem,
  H3,
  LinearProgress,
  StackLayout,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const WithMaxVal = (): ReactElement => {
  return (
    <StackLayout align="center">
      <H3> max = 500, value = 250</H3>
      <FlexItem>
        <CircularProgress aria-label="Download" value={250} max={500} />
      </FlexItem>
      <FlexItem>
        <LinearProgress aria-label="Download" value={250} max={500} />
      </FlexItem>
    </StackLayout>
  );
};
