import { FlowLayout, Input, Text } from "@salt-ds/core";
import {
  CallIcon,
  FilterClearIcon,
  FilterIcon,
  FlagIcon,
} from "@salt-ds/icons";
import type { ReactElement } from "react";

export const StaticAdornments = (): ReactElement => (
  <FlowLayout style={{ width: "256px" }}>
    <Input startAdornment={<FilterIcon aria-hidden />} defaultValue="Value" />
    <Input
      variant="secondary"
      startAdornment={
        <>
          <CallIcon aria-hidden />
          <Text>+1</Text>
        </>
      }
      defaultValue="Value"
    />
    <Input endAdornment={<Text>USD</Text>} defaultValue="Value" />
    <Input
      variant="secondary"
      startAdornment={<FlagIcon aria-hidden />}
      endAdornment={
        <>
          <Text>%</Text>
          <FilterClearIcon aria-hidden />
        </>
      }
      defaultValue="Value"
    />
  </FlowLayout>
);
