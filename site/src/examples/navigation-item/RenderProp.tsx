import { NavigationItem, StackLayout } from "@salt-ds/core";
import { type ReactElement, useState } from "react";

export const RenderProp = (): ReactElement => {
  const [expanded, setExpanded] = useState<boolean>(false);
  return (
    <nav>
      <StackLayout
        as="ul"
        gap="var(--salt-spacing-fixed-100)"
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
            render={(props) => <button {...props} />}
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
              render={(props) => <a {...props} />}
            >
              Render Prop Child
            </NavigationItem>
          </li>
        ) : null}
      </StackLayout>
    </nav>
  );
};
