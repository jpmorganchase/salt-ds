import { Label, StackLayout, Text } from "@salt-ds/core";
import { StaticList, StaticListItem } from "@salt-ds/lab";
import type { ReactElement } from "react";

const ListItem = () => (
  <StaticListItem>
    <StackLayout
      gap={0.5}
      style={{ padding: "var(--salt-spacing-75) 0", width: "100%" }}
    >
      <Text color="inherit">Item label</Text>
      <Label variant="secondary">Secondary label</Label>
    </StackLayout>
  </StaticListItem>
);

const ListItemWithDivider = () => (
  <StaticListItem divider>
    <StackLayout
      gap={0.5}
      style={{ padding: "var(--salt-spacing-75) 0", width: "100%" }}
    >
      <Text color="inherit">Item label</Text>
      <Label variant="secondary">Secondary label</Label>
    </StackLayout>
  </StaticListItem>
);

export const WithDividers = (): ReactElement => (
  <div style={{ width: "80%" }}>
    <StaticList style={{ width: "320px" }}>
      <ListItem />
      <ListItemWithDivider />
      <ListItemWithDivider />
      <ListItemWithDivider />
    </StaticList>
  </div>
);
