import { FlexLayout, FlowLayout, Input, Kbd } from "@salt-ds/core";
import { SearchIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const NestedInInput = (): ReactElement => (
  <FlowLayout style={{ maxWidth: "256px" }}>
    <Input
      bordered
      placeholder="Search"
      startAdornment={<SearchIcon />}
      endAdornment={
        <FlexLayout gap={0.5} wrap align="center">
          <Kbd>Cmd</Kbd>
          <Kbd>K</Kbd>
        </FlexLayout>
      }
    />
  </FlowLayout>
);
