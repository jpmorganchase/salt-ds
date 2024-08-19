import { Button, FlexLayout, StackLayout, Text } from "@salt-ds/core";
import { NoteIcon } from "@salt-ds/icons";
import { StaticList, StaticListItem } from "@salt-ds/lab";
import type { ReactElement } from "react";

const ListItem = () => (
  <StaticListItem>
    <FlexLayout gap={1} style={{ width: "100%" }}>
      <StackLayout gap={0.5}>
        <Text color="inherit">Item label</Text>
        <Text variant="secondary">Secondary label</Text>
      </StackLayout>
      <StackLayout direction={"row"} gap={0.5} style={{ marginLeft: "auto" }}>
        <Button variant="secondary" aria-label={"icon"}>
          {" "}
          <NoteIcon aria-hidden />
        </Button>
        <Button variant="secondary" aria-label={"icon"}>
          {" "}
          <NoteIcon aria-hidden />
        </Button>
      </StackLayout>
    </FlexLayout>
  </StaticListItem>
);

export const WithoutDescriptiveIcons = (): ReactElement => (
  <div style={{ width: "80%" }}>
    <StaticList style={{ width: "320px" }}>
      <ListItem />
      <ListItem />
      <ListItem />
      <ListItem />
      <ListItem />
    </StaticList>
  </div>
);
