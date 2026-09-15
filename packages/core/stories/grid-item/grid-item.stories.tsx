import { GridItem, GridLayout, Text } from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import "../layout/layout.stories.css";
export default {
  title: "Core/Layout/Grid Layout/Grid Item",
  component: GridItem,
  argTypes: {
    as: { type: "string" },
    colSpan: { control: { type: "number" } },
    rowSpan: { control: { type: "number" } },
    horizontalAlignment: { control: { type: "select" } },
    verticalAlignment: { control: { type: "select" } },
  },
} as Meta<typeof GridItem>;

const renderGridContent = <Text>Item</Text>;
const GridItemStory: StoryFn<typeof GridItem> = (args) => {
  return (
    <GridLayout
      rows={2}
      columns={{ xs: 2, md: 5 }}
      className="layout-container"
    >
      <GridItem className="layout-active-content" {...args}>
        <Text>Item</Text>
      </GridItem>
      {renderGridContent}
      {renderGridContent}
      {renderGridContent}
      {renderGridContent}
      <GridItem colSpan={{ xs: 2, md: 4 }}>
        <Text>Item spanning 4 columns</Text>
      </GridItem>
    </GridLayout>
  );
};
export const GridItemWrapper = GridItemStory.bind({});
GridItemWrapper.args = {
  colSpan: 1,
  rowSpan: 2,
};
