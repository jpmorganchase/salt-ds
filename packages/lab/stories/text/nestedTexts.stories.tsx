import { ComponentMeta, ComponentStory } from "@storybook/react";

import { Text, Link, H2, P } from "@jpmorganchase/uitk-lab";

export default {
  title: "Lab/Text",
  component: Text,
} as ComponentMeta<typeof Text>;

const excludeProps = [
  "children",
  "elementType",
  "maxRows",
  "showTooltip",
  "tooltipProps",
  "truncate",
  "style",
  "onOverflowChange",
];

const NestedTextsComponent: ComponentStory<typeof Text> = () => {
  const box = {
    border: "1px solid #ccc",
    padding: 10,
  };

  return (
    <div>
      <Link href="">
        <H2>Heading inside a Link</H2>
      </Link>
      <P>
        This is a <Link href="">link</Link> inside a paragraph.
      </P>
    </div>
  );
};
export const NestedTextsExample = NestedTextsComponent.bind({});
NestedTextsExample.parameters = {
  controls: {
    exclude: excludeProps,
  },
};
