import { GridItem, GridLayout } from "@jpmorganchase/uitk-core";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import "./styles.css";
export default {
  title: "Core/Layout/GridLayout/GridItem",
  component: GridItem,
  argTypes: {
    colSpan: { control: { type: "number" } },
    rowSpan: { control: { type: "number" } },
    horizontalAlignment: { control: { type: "select" } },
    verticalAlignment: { control: { type: "select" } },
  },
} as ComponentMeta<typeof GridItem>;

const GridItemContent = ({ active }: { active?: boolean }) => {
  return (
    <div
      className={`grid-item ${
        active ? "layout-active-content" : "layout-content"
      }`}
    >
      <p>Item</p>
    </div>
  );
};
const GridItemStory: ComponentStory<typeof GridItem> = (args) => {
  return (
    <div>
      <GridLayout rows={2} columns={5}>
        <GridItem {...args}>
          <GridItemContent active />
        </GridItem>
        <GridItemContent />
        <GridItemContent />
        <GridItemContent />
        <GridItemContent />
        <GridItem colSpan={4}>
          <GridItemContent />
        </GridItem>
      </GridLayout>
    </div>
  );
};
export const GridItemWrapper = GridItemStory.bind({});
GridItemWrapper.args = {
  colSpan: 1,
  rowSpan: 2,
};
