import { GridItem, GridLayout, GRID_ALIGNMENT_BASE } from "@brandname/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Layout/GridItem",
  component: GridItem,
} as ComponentMeta<typeof GridItem>;

const gridItemStyles = {
  padding: "1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const Template: ComponentStory<typeof GridItem> = () => {
  return (
    <GridItem style={{ ...gridItemStyles, background: "lightcyan" }}>
      <p>Item</p>
    </GridItem>
  );
};
export const ToolkitGridItem = Template.bind({});
ToolkitGridItem.args = {};

const gridLayoutStyle = { background: "lightblue" };

const InsideGrid: ComponentStory<typeof GridItem> = (args) => {
  return (
    <GridLayout
      rows={2}
      columns={5}
      rowGap="1rem"
      columnGap="1rem"
      style={gridLayoutStyle}
    >
      <GridItem
        style={{
          ...gridItemStyles,
          background: "lightcyan",
        }}
        rowSpan={2}
        colSpan={1}
        {...args}
      >
        <p>Item</p>
      </GridItem>
      <GridItem
        colSpan={2}
        style={{ ...gridItemStyles, background: "lightcoral" }}
      >
        <p>Item</p>
      </GridItem>
      <GridItem
        colSpan={2}
        style={{ ...gridItemStyles, background: "lightcoral" }}
      >
        <p>Item</p>
      </GridItem>
      <GridItem
        colSpan={4}
        style={{ ...gridItemStyles, background: "lightcoral" }}
      >
        <p>Item</p>
      </GridItem>
    </GridLayout>
  );
};
export const ToolkitGridItemInGridLayout = InsideGrid.bind({});
ToolkitGridItemInGridLayout.args = {};

ToolkitGridItemInGridLayout.argTypes = {
  colSpan: { control: { type: "number" } },
  colStart: { control: { type: "number" } },
  colEnd: { control: { type: "number" } },
  rowSpan: { control: { type: "number" } },
  rowStart: { control: { type: "number" } },
  rowEnd: { control: { type: "number" } },
  justify: {
    options: GRID_ALIGNMENT_BASE,
    control: { type: "select" },
  },
  align: {
    options: GRID_ALIGNMENT_BASE,
    control: { type: "select" },
  },
};
