import {
  BorderItem,
  BorderLayout,
  H3,
  SkipLink,
  StackLayout,
  Text,
  useId,
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemLabel,
  VerticalNavigationItemTrigger,
} from "@salt-ds/core";
import { Link, useLocation } from "react-router";
import { type Item, navData } from "./data";
import { MockHistory } from "./MockHistory";

function NavItem({ item }: { item: Item }) {
  const location = useLocation();

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

export const WithSkipLink = () => {
  const headerId = useId();

  return (
    <MockHistory>
      <p>Click here and press the Tab key to see the Skip Link.</p>
      <BorderLayout columnGap={2} rowGap={2} style={{ position: "relative" }}>
        <BorderItem position="north">
          <div
            style={{
              background: "var(--salt-container-secondary-background)",
              borderBottom:
                "var(--salt-size-fixed-100) var(--salt-separable-borderStyle) var(--salt-separable-primary-borderColor)",
              height: "calc(var(--salt-size-base) + var(--salt-spacing-200))",
            }}
          />
        </BorderItem>
        <BorderItem position="west">
          {headerId && (
            <SkipLink targetId={headerId}>Skip to main content</SkipLink>
          )}
          <VerticalNavigation
            aria-label="Sidebar with skip link"
            appearance="bordered"
            style={{ minWidth: "30ch" }}
          >
            {navData.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </VerticalNavigation>
        </BorderItem>
        <BorderItem position="center">
          <StackLayout direction="column" gap={1}>
            {/* The heading levels in this example are demonstrational only */}
            <H3 styleAs="h1" id={headerId}>
              With skip link
            </H3>
            <Text>
              This example demonstrates a vertical navigation with a skip link
              for accessibility. The skip link allows users to bypass the
              navigation and go directly to the main content.
            </Text>
            <Text>
              This placeholder text is provided to illustrate how content will
              appear within the component. The sentences are intended for
              demonstration only and do not convey specific information. Generic
              examples like this help review layout, spacing, and overall
              design. Adjust the wording as needed to fit your use case or
              display requirements.
            </Text>
          </StackLayout>
        </BorderItem>
      </BorderLayout>
    </MockHistory>
  );
};
