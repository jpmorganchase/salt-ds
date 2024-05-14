import React, { ReactElement, useState } from "react";
import {
  NavigationItem,
  NavigationItemRenderProps,
  StackLayout,
  Text,
} from "@salt-ds/core";

export const RenderElement = (): ReactElement => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const CustomLinkImplementation = (props: NavigationItemRenderProps) => (
    <a {...props} aria-label={"overridden-label"}>
      <Text>Your Own Link Implementation</Text>
    </a>
  );
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
