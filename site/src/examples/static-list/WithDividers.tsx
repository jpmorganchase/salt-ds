import { Divider, StackLayout, Text } from "@salt-ds/core";
import { StaticList, StaticListItem } from "@salt-ds/lab";
import type { ReactElement } from "react";

const ListItem = () => (
  <StaticListItem>
    <StackLayout gap={0.5}>
      <Text color="inherit">Item label</Text>
      <Text styleAs="label" color="secondary">
        Secondary label
      </Text>
    </StackLayout>
  </StaticListItem>
);

export const WithDividers = (): ReactElement => (
  <div style={{ width: "80%" }}>
    <StaticList style={{ width: "320px" }}>
      <ListItem />
      <Divider variant="tertiary" />
      <ListItem />
      <Divider variant="tertiary" />
      <ListItem />
      <Divider variant="tertiary" />
      <ListItem />
    </StaticList>
  </div>
);
