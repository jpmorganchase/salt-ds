import { CSSProperties } from "react";
import {
  GridLayout,
  GridItem,
  Logo,
  Avatar,
  Card,
} from "@jpmorganchase/uitk-lab";
import { ToolkitProvider } from "@jpmorganchase/uitk-core";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import PlaceholderLogo from "docs/assets/placeholder.svg";

export default {
  title: "Layout/GridLayout",
  component: GridLayout,
  subcomponents: { GridItem },
} as ComponentMeta<typeof GridLayout>;

const gridItemStyles = {
  padding: 16,
  height: "calc(100% - 32px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const gridLayoutStyle = {
  background: "lightblue",
};
const Template: ComponentStory<typeof GridLayout> = (args) => {
  return (
    <div style={gridLayoutStyle}>
      <GridLayout {...args}>
        {Array.from({ length: 12 }, (_, index) => (
          <GridItem key={index}>
            <div style={{ ...gridItemStyles, background: "lightcyan" }}>
              <p>{`GridItem ${index + 1}`}</p>
            </div>
          </GridItem>
        ))}
      </GridLayout>
    </div>
  );
};
export const ToolkitGridLayout = Template.bind({});
ToolkitGridLayout.args = {
  columns: 12,
  rows: 1,
  rowGap: 1,
  columnGap: 1,
};

const MultipleRows: ComponentStory<typeof GridLayout> = (args) => {
  return (
    <div style={gridLayoutStyle}>
      <GridLayout {...args}>
        {Array.from({ length: 12 }, (_, index) => (
          <GridItem key={index}>
            <div style={{ ...gridItemStyles, background: "lightcyan" }}>
              <p>{`GridItem ${index + 1}`}</p>
            </div>
          </GridItem>
        ))}
      </GridLayout>
    </div>
  );
};
export const ToolkitGridLayoutMultipleRows = MultipleRows.bind({});
ToolkitGridLayoutMultipleRows.args = {
  columns: 4,
  rows: 3,
  gap: 2,
};

const responsiveGridItemStyles = {
  ...gridItemStyles,
  minHeight: 200,
  minWidth: 200,
  background: "lightcyan",
};

const ResponsiveView: ComponentStory<typeof GridLayout> = (args) => {
  return (
    <div style={gridLayoutStyle}>
      <GridLayout {...args}>
        <GridItem
          colSpan={{ xs: 1, sm: 1, md: 6, lg: 3, xl: 3 }}
          rowSpan={{ xs: 1, sm: 1, md: 2, lg: 1, xl: 1 }}
        >
          <div style={responsiveGridItemStyles}>
            <p>GridItem 1</p>
          </div>
        </GridItem>
        <GridItem
          colSpan={{ xs: 1, sm: 1, md: 3, lg: 3, xl: 3 }}
          rowSpan={{ xs: 1, sm: 1, md: 4, lg: 1, xl: 1 }}
        >
          <div style={responsiveGridItemStyles}>
            <p>GridItem 2</p>
          </div>
        </GridItem>
        <GridItem
          colSpan={{ xs: 1, sm: 1, md: 3, lg: 3, xl: 3 }}
          rowSpan={{ xs: 1, sm: 1, md: 4, lg: 1, xl: 1 }}
        >
          <div style={responsiveGridItemStyles}>
            <p>GridItem 3</p>
          </div>
        </GridItem>
        <GridItem
          colSpan={{ xs: 1, sm: 1, md: 6, lg: 3, xl: 3 }}
          rowSpan={{ xs: 1, sm: 1, md: 2, lg: 1, xl: 1 }}
        >
          <div style={responsiveGridItemStyles}>
            <p>GridItem 4</p>
          </div>
        </GridItem>
      </GridLayout>
    </div>
  );
};
export const ToolkitGridLayoutResponsiveView = ResponsiveView.bind({});
ToolkitGridLayoutResponsiveView.args = {
  columns: { xs: 1, sm: 2, md: 12, lg: 12, xl: 12 },
  rows: { xs: 4, sm: 2, md: 4, lg: 1, xl: 1 },
  rowGap: 1,
  columnGap: 1,
};

const breakpoints = {
  xs: 0,
  sm: 500,
  md: 860,
  lg: 1180,
  xl: 1820,
};

const CustomBreakpoints: ComponentStory<typeof GridLayout> = (args) => {
  return (
    <ToolkitProvider breakpoints={breakpoints}>
      <div style={gridLayoutStyle}>
        <GridLayout {...args}>
          <GridItem
            colSpan={{ xs: 1, sm: 1, md: 6, lg: 3, xl: 3 }}
            rowSpan={{ xs: 1, sm: 1, md: 2, lg: 1, xl: 1 }}
          >
            <div style={responsiveGridItemStyles}>
              <p>GridItem 1</p>
            </div>
          </GridItem>
          <GridItem
            colSpan={{ xs: 1, sm: 1, md: 3, lg: 3, xl: 3 }}
            rowSpan={{ xs: 1, sm: 1, md: 4, lg: 1, xl: 1 }}
          >
            <div style={responsiveGridItemStyles}>
              <p>GridItem 2</p>
            </div>
          </GridItem>
          <GridItem
            colSpan={{ xs: 1, sm: 1, md: 3, lg: 3, xl: 3 }}
            rowSpan={{ xs: 1, sm: 1, md: 4, lg: 1, xl: 1 }}
          >
            <div style={responsiveGridItemStyles}>
              <p>GridItem 3</p>
            </div>
          </GridItem>
          <GridItem
            colSpan={{ xs: 1, sm: 1, md: 6, lg: 3, xl: 3 }}
            rowSpan={{ xs: 1, sm: 1, md: 2, lg: 1, xl: 1 }}
          >
            <div style={responsiveGridItemStyles}>
              <p>GridItem 4</p>
            </div>
          </GridItem>
        </GridLayout>
      </div>
    </ToolkitProvider>
  );
};
export const ToolkitGridLayoutCustomBreakpoints = CustomBreakpoints.bind({});
ToolkitGridLayoutCustomBreakpoints.args = {
  columns: { xs: 1, sm: 2, md: 12, lg: 12, xl: 12 },
  rows: { xs: 4, sm: 2, md: 4, lg: 1, xl: 1 },
  rowGap: 1,
  columnGap: 1,
};

const Border: ComponentStory<typeof GridLayout> = (args) => {
  return (
    <div style={gridLayoutStyle}>
      <GridLayout {...args}>
        <GridItem colSpan={4}>
          <div
            style={{
              ...gridItemStyles,
              backgroundColor: "#c5afa4",
              color: "#000",
            }}
          >
            <p>Header</p>
          </div>
        </GridItem>
        <GridItem colSpan={1}>
          <div
            style={{
              ...gridItemStyles,
              backgroundColor: "#cc7e85",
              color: "#000",
            }}
          >
            <p>Left</p>
          </div>
        </GridItem>
        <GridItem colSpan={2}>
          <div
            style={{
              ...gridItemStyles,
              backgroundColor: "#cf4d6f",
              minWidth: 100,
              color: "#000",
            }}
          >
            <p>Main</p>
          </div>
        </GridItem>
        <GridItem colSpan={1}>
          <div
            style={{
              ...gridItemStyles,
              backgroundColor: "#a36d90",
              color: "#000",
            }}
          >
            <p>Right</p>
          </div>
        </GridItem>
        <GridItem colSpan={4}>
          <div
            style={{
              ...gridItemStyles,
              backgroundColor: "#76818e",
              color: "#000",
            }}
          >
            <p>Bottom</p>
          </div>
        </GridItem>
      </GridLayout>
    </div>
  );
};
export const ToolkitGridLayoutBorder = Border.bind({});
ToolkitGridLayoutBorder.args = {
  columns: 4,
  rows: 3,
  gap: 0,
};

const headerStyles: CSSProperties = {
  color: "#70737A",
  fontWeight: 600,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
};
const textStyles = { color: "#707279" };
const copyrightStyles: CSSProperties = {
  color: "#70737A",
  borderTop: "1px solid #D9DDE3",
  textAlign: "center",
};

const footerHeaders = ["Solutions", "Support", "Company", "Legal"];

const footerLinks = [
  ["Marketing", "Analytics", "Commerce", "Insights"],
  ["Pricing", "Documentation", "Guides", "API Status"],
  ["About", "Blog", "Jobs", "Press", "Partners"],
  ["Claim", "Privacy", "Terms"],
];

const footerColumns = footerHeaders.map((header, index) => (
  <GridItem key={index}>
    <p style={headerStyles}>{header}</p>
    {footerLinks[index].map((link, i) => (
      <p style={textStyles} key={i}>
        {link}
      </p>
    ))}
  </GridItem>
));

const Footer: ComponentStory<typeof GridLayout> = (args) => {
  return (
    <GridLayout {...args}>
      <GridItem
        colSpan={2}
        horizontalAlignment="center"
        verticalAlignment="center"
      >
        <Logo src={PlaceholderLogo} appTitle="Toolkit" />
        <p style={textStyles}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </GridItem>
      {footerColumns}
      <GridItem colSpan={6}>
        <div style={copyrightStyles}>
          <p>© 2022 BrandName All rights reserved.</p>
        </div>
      </GridItem>
    </GridLayout>
  );
};
export const ToolkitGridLayoutFooter = Footer.bind({});
ToolkitGridLayoutFooter.args = {
  columns: 6,
  columnGap: 8,
  rowGap: 1,
};

const blogMainContent = (
  <>
    <h2>Lorem Ipsum</h2>
    <p>
      Magna adipisicing non culpa ipsum occaecat mollit est ullamco adipisicing.
      Minim sit anim laborum elit ullamco adipisicing nulla consectetur dolore.
      Et veniam excepteur velit officia. Eu nisi sit aliqua enim sit commodo
      fugiat aute ut consectetur do consequat proident labore.
    </p>
    <p>
      Sunt culpa ex sunt sit consequat officia eu ipsum quis velit. Proident
      tempor do ullamco qui minim do do consequat in commodo et occaecat in est.
      Dolor officia et ex incididunt reprehenderit culpa exercitation minim
      occaecat.
    </p>
    <p>
      Adipisicing esse duis consectetur nisi magna dolore consequat cillum
      mollit sit quis duis exercitation. Incididunt minim qui est ex non mollit.
      Eu culpa cillum ad id. Lorem dolor veniam tempor ad labore labore
      incididunt eu dolore officia. Eu anim consequat elit eiusmod non nostrud
      nulla id laboris irure exercitation ea voluptate. Cupidatat veniam ullamco
      officia Lorem Lorem ex et elit labore adipisicing magna adipisicing
      aliquip. Reprehenderit voluptate cupidatat esse voluptate enim deserunt.
    </p>
    <Card style={{ margin: "2em 0" }}>
      <div>
        <h1>Lorem Ipsum</h1>
        <span>
          Aliqua deserunt eiusmod reprehenderit reprehenderit cillum nostrud.
        </span>
      </div>
    </Card>
    <p>Aliqua aliqua amet nulla anim est.</p>
  </>
);

const Blog: ComponentStory<typeof GridLayout> = (args) => {
  return (
    <GridLayout {...args} style={{ padding: "2em" }}>
      <GridItem colSpan={3}>
        <h1>Lorem Ipsum</h1>
        <img
          src="https://via.placeholder.com/1305x555?text=Blog+Image"
          alt="placeholder"
          style={{ width: "100%" }}
        />
      </GridItem>
      <GridItem colSpan={2}>
        <p>
          Nulla est duis sunt amet. Adipisicing irure ipsum cupidatat ullamco
          mollit laboris ut. Voluptate ipsum pariatur ut aliquip mollit in
          mollit.
        </p>
        {blogMainContent}
        {blogMainContent}
        {blogMainContent}
      </GridItem>
      <GridItem colSpan={1}>
        <div style={{ alignItems: "center", display: "flex" }}>
          <div style={{ marginRight: "1em" }}>
            <Avatar children="ABC" size="large" />
          </div>
          <div>Lorem Ipsum</div>
        </div>
        <p>
          Id aliqua veniam in sit dolore ea dolore sit. Ea Lorem exercitation
          voluptate irure occaecat. Ipsum id culpa aute occaecat amet eiusmod
          ut. Dolore sunt qui in anim ea cupidatat nulla id commodo pariatur
          incididunt fugiat anim ex. Labore enim adipisicing sint tempor est ea
          qui ex nulla eiusmod. Occaecat ex ad adipisicing ullamco aliqua id
          ipsum eiusmod pariatur dolor cupidatat sunt fugiat labore.
        </p>
        <p style={{ borderTop: "1px solid #EAEDEF", padding: "1em 0" }}>
          16 December 2021
        </p>
      </GridItem>
    </GridLayout>
  );
};
export const ToolkitGridLayoutBlog = Blog.bind({});
ToolkitGridLayoutBlog.args = {
  columns: 3,
  columnGap: 12,
  rowGap: 1,
};
