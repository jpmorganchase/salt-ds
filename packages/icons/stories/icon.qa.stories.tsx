import { AddDocumentIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer } from "docs/components";
import { allIcons } from "./icon.all";
import "@salt-ds/icons/saltIcons.css";
export default {
  title: "Icons/Icon/Icon QA",
  globals: {
    a11y: {
      manual: true,
    },
  },
} as Meta;

const allIconNames = allIcons.map((iconComponent) => iconComponent.displayName);

const sizes = [1, 2, 3] as const;
export const IconSizes: StoryFn = () => {
  return (
    <QAContainer height={500} width={1500} cols={4}>
      <AddDocumentIcon size={1} />
      <AddDocumentIcon size={2} />
      <AddDocumentIcon size={3} />
      <AddDocumentIcon size={4} />
    </QAContainer>
  );
};

export const AllIcons: StoryFn = () => {
  return (
    <>
      {sizes.map((size) => (
        <div
          key={size}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(15, auto)",
            gap: 8,
            padding: "12px 0",
          }}
        >
          {allIcons.map((IconComponent) => (
            <IconComponent key={IconComponent.displayName} size={size} />
          ))}
        </div>
      ))}
    </>
  );
};

AllIcons.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CssBackground: StoryFn = () => {
  return (
    <QAContainer
      width={1400}
      itemPadding={12}
      vertical
      itemWidthAuto
      transposeDensity
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(20, auto)",
          gap: 8,
          padding: "12px 0",
        }}
      >
        {allIconNames.map((iconName) =>
          iconName ? (
            <div
              key={iconName}
              className={`should-not-impact saltIcons-${iconName.replace(
                "Icon",
                "",
              )}`}
            />
          ) : null,
        )}
      </div>
    </QAContainer>
  );
};

CssBackground.parameters = {
  chromatic: { disableSnapshot: false },
};
