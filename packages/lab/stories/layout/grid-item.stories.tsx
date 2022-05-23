import { GridItem, GridLayout } from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Layout/GridLayout/GridItem",
  component: GridItem,
  argTypes: {
    colSpan: { control: { type: "number" } },
    rowSpan: { control: { type: "number" } },
    horizontalAlignment: { control: { type: "select" } },
    verticalAlignment: { control: { type: "select" } },
  },
} as ComponentMeta<typeof GridItem>;

const gridItemStyles = {
  padding: 16,
  height: "calc(100% - 32px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const gridLayoutStyle = { background: "lightblue" };

const GridItemStory: ComponentStory<typeof GridItem> = (args) => {
  return (
    <div style={gridLayoutStyle}>
      <GridLayout rows={2} columns={5}>
        <GridItem {...args}>
          <div
            style={{
              ...gridItemStyles,
              background: "lightcyan",
            }}
          >
            <p>Item</p>
          </div>
        </GridItem>
        <GridItem colSpan={2}>
          <div style={{ ...gridItemStyles, background: "lightcoral" }}>
            <p>Item</p>
          </div>
        </GridItem>
        <GridItem colSpan={2}>
          <div style={{ ...gridItemStyles, background: "lightcoral" }}>
            <p>Item</p>
          </div>
        </GridItem>
        <GridItem colSpan={4}>
          <div style={{ ...gridItemStyles, background: "lightcoral" }}>
            <p>Item</p>
          </div>
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
