import { createElement } from "react";
import { allIcons } from "./icon.all";
import { QAContainer } from "docs/components";
import { Meta, Story } from "@storybook/react";

export default {
  title: "Icons/Icon/QA",
} as Meta;

const sizes = ["small", "medium", "large"] as const;

export const AllIcons: Story = () => {
  return (
    <>
      {sizes.map((size) => (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(15, auto)",
            gap: 8,
            padding: "6px 0",
          }}
        >
          {allIcons.map((iconComponent, i) =>
            createElement(iconComponent, { key: i, size })
          )}
        </div>
      ))}
    </>
  );
};

AllIcons.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit: Story = () => {
  return (
    <QAContainer
      imgSrc="/visual-regression-screenshots/Icon-vr-snapshot.png"
      height={1400}
      width={900}
    >
      <div>
        {sizes.map((size, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(15, auto)",
              gap: 8,
              padding: "6px 0",
            }}
          >
            {allIcons.map((iconComponent, i) =>
              createElement(iconComponent, { key: i, size })
            )}
          </div>
        ))}
      </div>
    </QAContainer>
  );
};
