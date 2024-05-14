import { FC, ReactElement, useState } from "react";
import {
  NavigationItem,
  NavigationItemRenderProps,
  StackLayout,
} from "@salt-ds/core";

const render: FC<NavigationItemRenderProps> = (props) => {
  console.log("render NavigationItem with callback props", props);
  const { parent, parentProps, linkProps } = props;
  if (parent) {
    return <button {...parentProps} />;
  } else {
    return <a {...linkProps} />;
  }
};

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
            render={render}
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
              render={render}
            >
              Render Prop Child
            </NavigationItem>
          </li>
        ) : null}
      </StackLayout>
    </nav>
  );
};
