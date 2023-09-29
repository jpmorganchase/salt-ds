import { Meta, StoryFn } from "@storybook/react";

import { allIcons } from "./icon.all";

export default {
  title: "Icons/Icon/QA",
} as Meta;

const sizes = [1, 2, 3] as const;

export const AllIcons: StoryFn = () => {
  return (
    <>
      {sizes.map((size) => (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(15, auto)",
            gap: 8,
            padding: "12px 0",
          }}
        >
          {allIcons.map((IconComponent, i) => (
            <IconComponent key={i} size={size} />
          ))}
        </div>
      ))}
    </>
  );
};

AllIcons.parameters = {
  chromatic: { disableSnapshot: false },
};
