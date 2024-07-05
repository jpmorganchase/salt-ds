import React, { ReactElement, useState } from "react";
import { NavigationItem, StackLayout, Text } from "@salt-ds/core";

const CustomLinkImplementation = (props: any) => (
  <a {...props} aria-label={"overridden-label"}>
    <Text>Your Own Link Implementation</Text>
  </a>
);

export const RenderElement = (): ReactElement => {
  const [expanded, setExpanded] = useState<boolean>(false);
  return (
    <nav>
      <StackLayout
        as="ul"
        gap="var(--salt-size-border)"
        style={{
          width: 250,
          listStyle: "none",
          paddingLeft: 0,
        }}
      >
        <li>
          <NavigationItem
            expanded={expanded}
            level={0}
            onExpand={() => setExpanded(!expanded)}
            orientation="vertical"
            parent={true}
            render={<button />}
          >
            Render Prop Parent
          </NavigationItem>
        </li>
        {expanded ? (
          <li>
            <NavigationItem
              href="#"
              level={1}
              orientation="vertical"
              render={<CustomLinkImplementation />}
            >
              Render Prop Child
            </NavigationItem>
          </li>
        ) : null}
      </StackLayout>
    </nav>
  );
};
