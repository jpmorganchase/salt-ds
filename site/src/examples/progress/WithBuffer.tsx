import {
  CircularProgress,
  FlexItem,
  H3,
  LinearProgress,
  StackLayout,
} from "@salt-ds/core";
import { ReactElement } from "react";

export const WithBuffer = (): ReactElement => {
  return (
    <StackLayout align="center">
      <H3> value = 38, buffer value = 60</H3>

      <FlexItem>
        <CircularProgress aria-label="Download" value={38} bufferValue={60} />
      </FlexItem>
      <FlexItem>
        <LinearProgress aria-label="Download" value={38} bufferValue={60} />
      </FlexItem>
    </StackLayout>
  );
};
