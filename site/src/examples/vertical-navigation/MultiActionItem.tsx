import {
  Button,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  StackLayout,
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemExpansionIcon,
  VerticalNavigationItemLabel,
  VerticalNavigationItemTrigger,
  VerticalNavigationSubMenu,
} from "@salt-ds/core";
import { Link, useLocation } from "react-router";
import { type Item, navData } from "./data";
import { MockHistory } from "./MockHistory";

function ExpandButtonItem(props: { item: Item }) {
  const { item } = props;

  const location = useLocation();

  if (Array.isArray(item.children) && item.children.length > 0) {
    return (
      <VerticalNavigationItem active={location.pathname === item.href}>
        <Collapsible>
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
        </Collapsible>
      </VerticalNavigationItem>
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
        <VerticalNavigation
          aria-label="Indicator sidebar with multi-action items"
          appearance="indicator"
        >
          {navData.map((item) => (
            <ExpandButtonItem key={item.title} item={item} />
          ))}
        </VerticalNavigation>
      </MockHistory>
      <MockHistory>
        <VerticalNavigation
          aria-label="Bordered sidebar with multi-action items"
          appearance="bordered"
        >
          {navData.map((item) => (
            <ExpandButtonItem key={item.title} item={item} />
          ))}
        </VerticalNavigation>
      </MockHistory>
    </StackLayout>
  );
};
