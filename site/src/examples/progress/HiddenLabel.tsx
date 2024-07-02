import {
  CircularProgress,
  FlexItem,
  LinearProgress,
  StackLayout,
} from "@salt-ds/core";
import { ReactElement } from "react";

export const HiddenLabel = (): ReactElement => {
  return (
    <StackLayout align="center">
      <FlexItem>
        <CircularProgress aria-label="Download" value={38} hideLabel />
      </FlexItem>
      <FlexItem>
        <LinearProgress aria-label="Download" value={38} hideLabel />
      </FlexItem>
    </StackLayout>
  );
};
