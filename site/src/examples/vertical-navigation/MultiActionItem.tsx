import { Button, StackLayout } from "@salt-ds/core";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemExpansionIcon,
  VerticalNavigationItemLabel,
  VerticalNavigationItemTrigger,
  VerticalNavigationSubMenu,
} from "@salt-ds/lab";
import { Link, useLocation } from "react-router";
import { type Item, navData } from "./data";
import { MockHistory } from "./MockHistory";

function ExpandButtonItem(props: { item: Item }) {
  const { item } = props;

  const location = useLocation();

  if (Array.isArray(item.children) && item.children.length > 0) {
    return (
      <Collapsible>
        <VerticalNavigationItem active={location.pathname === item.href}>
          <VerticalNavigationItemContent>
            <VerticalNavigationItemTrigger render={<Link to={item.href} />}>
              <VerticalNavigationItemLabel>
                {item.title}
              </VerticalNavigationItemLabel>
            </VerticalNavigationItemTrigger>
            <CollapsibleTrigger>
              <Button appearance="transparent">
                <VerticalNavigationItemExpansionIcon />
              </Button>
            </CollapsibleTrigger>
          </VerticalNavigationItemContent>
          <CollapsiblePanel>
            <VerticalNavigationSubMenu>
              {item.children.map((child) => (
                <ExpandButtonItem key={child.title} item={child} />
              ))}
            </VerticalNavigationSubMenu>
          </CollapsiblePanel>
        </VerticalNavigationItem>
      </Collapsible>
    );
  }

  return (
    <VerticalNavigationItem active={location.pathname === item.href}>
      <VerticalNavigationItemContent>
        <VerticalNavigationItemTrigger render={<Link to={item.href} />}>
          <VerticalNavigationItemLabel>
            {item.title}
          </VerticalNavigationItemLabel>
        </VerticalNavigationItemTrigger>
      </VerticalNavigationItemContent>
    </VerticalNavigationItem>
  );
}

export const MultiActionItem = () => {
  return (
    <StackLayout direction="row" gap={6}>
      <MockHistory>
        <VerticalNavigation appearance="indicator">
          {navData.map((item) => (
            <ExpandButtonItem key={item.title} item={item} />
          ))}
        </VerticalNavigation>
      </MockHistory>
      <MockHistory>
        <VerticalNavigation appearance="bordered">
          {navData.map((item) => (
            <ExpandButtonItem key={item.title} item={item} />
          ))}
        </VerticalNavigation>
      </MockHistory>
    </StackLayout>
  );
};
