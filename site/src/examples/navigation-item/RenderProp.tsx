import { ReactElement, useState } from "react";
import { NavigationItem, StackLayout } from "@salt-ds/core";

export const RenderProp = (): ReactElement => {
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
