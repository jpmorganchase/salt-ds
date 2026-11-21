import { BorderItem, BorderLayout } from "@salt-ds/core";
import { GithubIcon, SymphonyIcon } from "@salt-ds/icons";
import { DesktopAppHeader } from "./AppHeader";

export const HeaderOnly = () => {
  const items = ["Home", "About", "Services", "Contact"];
  const utilities = [
    { icon: <SymphonyIcon aria-hidden />, key: "Symphony" },
    { icon: <GithubIcon aria-hidden />, key: "GitHub" },
  ];

  return (
    <BorderLayout style={{ width: "100%" }}>
      <BorderItem position="north">
        <DesktopAppHeader items={items} utilities={utilities} />
      </BorderItem>
      <BorderItem
        style={{
          marginTop: "calc(var(--salt-size-base) + var(--salt-spacing-200))",
        }}
        position="center"
      >
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            style={{
              padding: "var(--salt-spacing-400)",
              margin: "var(--salt-spacing-400)",
              backgroundColor: "var(--salt-container-secondary-background)",
            }}
          />
        ))}
      </BorderItem>
    </BorderLayout>
  );
};
