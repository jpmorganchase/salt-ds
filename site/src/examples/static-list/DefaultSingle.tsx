import { StackLayout, Text } from "@salt-ds/core";
import { StaticList, StaticListItem } from "@salt-ds/lab";
import type { ReactElement } from "react";

const ListItem = () => (
  <StaticListItem>
    <StackLayout gap={0.5} style={{ padding: 'var(--salt-spacing-100) 0', width: '100%' }}>
      <Text color="inherit">Item label</Text>
      <Text variant="secondary">Secondary label</Text>
    </StackLayout>
  </StaticListItem>
);

export const DefaultSingle = (): ReactElement => (
  <div style={{ width: "80%" }}>
    <StaticList style={{ width: "320px" }}>
      <ListItem />
    </StaticList>
  </div>
);
