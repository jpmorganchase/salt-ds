import { ReactElement } from "react";
import { FlowLayout, Input, Text } from "@salt-ds/core";
import { FilterIcon, CallIcon, FlagIcon, FilterClearIcon } from "@salt-ds/icons";

export const StaticAdornments = (): ReactElement => (
    <FlowLayout style={{ width: "256px" }}>
    <Input
      startAdornment={<FilterIcon />}
      defaultValue="Value"
    />
    <Input
      variant="secondary"
      startAdornment={
        <>
          <CallIcon />
          <Text>+1</Text>
        </>
      }
      defaultValue="Value"
    />
    <Input
      endAdornment={<Text>USD</Text>}
      defaultValue="Value"
    />
    <Input
      variant="secondary"
      startAdornment={<FlagIcon />}
      endAdornment={
        <>
          <Text>%</Text>
          <FilterClearIcon />
        </>
      }
      defaultValue="Value"
    />
  </FlowLayout>
);
