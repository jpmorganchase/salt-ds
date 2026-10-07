import {
  BorderItem,
  BorderLayout,
  Link,
  StackLayout,
  Text,
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemLabel,
  VerticalNavigationItemTrigger,
} from "@salt-ds/core";
import { useState } from "react";
import { Header } from "./SingleLevel";

export const SecondaryNavigation = () => {
  const navigationData = [
    { id: "overview", name: "Overview" },
    { id: "exposure", name: "Exposure" },
    { id: "positions", name: "Positions" },
    { id: "limits", name: "Limits" },
  ];
  const [active, setActive] = useState(navigationData[0].name);

  return (
    <BorderLayout>
      <BorderItem position="north" sticky>
        <Header />
      </BorderItem>
      <BorderItem position="center">
        <StackLayout gap={4} style={{ padding: "var(--salt-spacing-400)" }}>
          {navigationData.map((item) => (
            <section
              id={item.id}
              key={item.name}
              style={{
                minHeight: "160px",
                padding: "var(--salt-spacing-400)",
                backgroundColor: "var(--salt-container-tertiary-background)",
              }}
            >
              <Text
                style={{ fontWeight: "var(--salt-text-fontWeight-strong)" }}
              >
                {item.name}
              </Text>
            </section>
          ))}
        </StackLayout>
      </BorderItem>
      <BorderItem
        position="east"
        sticky
        style={{
          top: "calc(var(--salt-spacing-300) * 2)",
          maxHeight: "calc(100vh - var(--salt-spacing-300) * 2)",
          padding: "var(--salt-spacing-200)",
        }}
      >
        <aside style={{ width: "180px" }}>
          <VerticalNavigation aria-label="On-page sections">
            {navigationData.map((item) => (
              <VerticalNavigationItem
                active={active === item.name}
                key={item.name}
              >
                <VerticalNavigationItemContent>
                  <VerticalNavigationItemTrigger
                    render={<Link href={`#${item.id}`} />}
                    onClick={(event) => {
                      event.preventDefault();
                      setActive(item.name);
                    }}
                  >
                    <VerticalNavigationItemLabel>
                      {item.name}
                    </VerticalNavigationItemLabel>
                  </VerticalNavigationItemTrigger>
                </VerticalNavigationItemContent>
              </VerticalNavigationItem>
            ))}
          </VerticalNavigation>
        </aside>
      </BorderItem>
    </BorderLayout>
  );
};
