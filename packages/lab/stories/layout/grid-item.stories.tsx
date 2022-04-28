import { GridItem, GridLayout } from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Layout/GridItem",
  component: GridItem,
} as ComponentMeta<typeof GridItem>;

const gridItemStyles = {
  padding: 16,
  height: "calc(100% - 32px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const Template: ComponentStory<typeof GridItem> = () => {
  return (
    <GridItem>
      <div style={{ ...gridItemStyles, background: "lightcyan" }}>
        <p>Item</p>
      </div>
    </GridItem>
  );
};
export const ToolkitGridItem = Template.bind({});
ToolkitGridItem.args = {};

const gridLayoutStyle = { background: "lightblue" };

const VerticalAlignmentInsideGrid: ComponentStory<typeof GridItem> = (args) => {
  return (
    <div style={gridLayoutStyle}>
      <GridLayout rows={2} columns={5}>
        <GridItem rowSpan={2} colSpan={1} {...args}>
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
export const ToolkitGridItemVerticalAlignment =
  VerticalAlignmentInsideGrid.bind({});
ToolkitGridItemVerticalAlignment.args = {};

ToolkitGridItemVerticalAlignment.argTypes = {
  colSpan: { control: { type: "number" } },
  rowSpan: { control: { type: "number" } },
};

const HorizontalAlignmentInsideGrid: ComponentStory<typeof GridItem> = (
  args
) => {
  return (
    <div style={gridLayoutStyle}>
      <GridLayout rows={2} columns={5}>
        <GridItem rowSpan={2} colSpan={1}>
          <div
            style={{
              ...gridItemStyles,
              background: "lightcoral",
            }}
          >
            <p>Item</p>
          </div>
        </GridItem>
        <GridItem colSpan={2} {...args}>
          <div style={{ ...gridItemStyles, background: "lightcyan" }}>
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
export const ToolkitGridItemHorizontalAlignment =
  HorizontalAlignmentInsideGrid.bind({});
ToolkitGridItemHorizontalAlignment.args = {};

ToolkitGridItemHorizontalAlignment.argTypes = {
  colSpan: { control: { type: "number" } },
  rowSpan: { control: { type: "number" } },
};
