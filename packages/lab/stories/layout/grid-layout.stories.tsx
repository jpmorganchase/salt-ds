import { CSSProperties } from "react";
import {
  GridLayout,
  GridItem,
  GRID_ALIGNMENT_BASE,
  GRID_LAYOUT_CONTENT_ALIGNMENT,
  Logo,
  Avatar,
  FlexLayout,
  FlexItem,
  Card,
} from "@brandname/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import PlaceholderLogo from "docs/assets/placeholder.svg";

export default {
  title: "Layout/GridLayout",
  component: GridLayout,
} as ComponentMeta<typeof GridLayout>;

const gridItemStyles = {
  padding: "1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const gridLayoutStyle = {
  background: "lightblue",
};
const Template: ComponentStory<typeof GridLayout> = (args) => {
  return (
    <GridLayout style={gridLayoutStyle} {...args}>
      {Array.from({ length: 12 }, (_, index) => (
        <GridItem
          style={{ ...gridItemStyles, background: "lightcyan" }}
          {...args}
        >
          <p>{`GridItem ${index + 1}`}</p>
        </GridItem>
      ))}
    </GridLayout>
  );
};
export const ToolkitGridLayout = Template.bind({});
ToolkitGridLayout.args = {
  display: "grid",
  columns: 12,
  rows: 1,
  columnGap: "1rem",
  rowGap: "1rem",
  justifyItems: "stretch",
  alignItems: "stretch",
  justifyContent: "stretch",
  alignContent: "stretch",
  autoColumns: "auto",
  autoRows: "auto",
};

ToolkitGridLayout.argTypes = {
  display: {
    options: ["grid", "inline-grid"],
    control: { type: "radio" },
  },
  justifyItems: {
    options: GRID_ALIGNMENT_BASE,
    control: { type: "select" },
  },
  alignItems: {
    options: [...GRID_ALIGNMENT_BASE, "baseline"],
    control: { type: "select" },
  },
  justifyContent: {
    options: GRID_LAYOUT_CONTENT_ALIGNMENT,
    control: { type: "select" },
  },
  alignContent: {
    options: GRID_LAYOUT_CONTENT_ALIGNMENT,
    control: { type: "select" },
  },
};

const Border: ComponentStory<typeof GridLayout> = (args) => {
  return (
    <GridLayout style={{ ...gridLayoutStyle }} {...args}>
      <GridItem
        style={{ ...gridItemStyles, backgroundColor: "#c5afa4" }}
        colSpan={4}
      >
        <p>Header</p>
      </GridItem>
      <GridItem
        colSpan={1}
        style={{ ...gridItemStyles, backgroundColor: "#cc7e85" }}
      >
        <p>Left</p>
      </GridItem>
      <GridItem
        colSpan={2}
        style={{ ...gridItemStyles, backgroundColor: "#cf4d6f", minWidth: 100 }}
      >
        <p>Main</p>
      </GridItem>
      <GridItem
        colSpan={1}
        style={{ ...gridItemStyles, backgroundColor: "#a36d90" }}
      >
        <p>Right</p>
      </GridItem>
      <GridItem
        colSpan={4}
        style={{ ...gridItemStyles, backgroundColor: "#76818e" }}
      >
        <p>Bottom</p>
      </GridItem>
    </GridLayout>
  );
};
export const ToolkitGridLayoutBorder = Border.bind({});
ToolkitGridLayoutBorder.args = {
  display: "grid",
  columns: 4,
  rows: 3,
  gridSpace: "auto",
  columnGap: 0,
  rowGap: 0,
  justifyItems: "stretch",
  alignItems: "stretch",
  justifyContent: "stretch",
  alignContent: "stretch",
  autoColumns: "auto",
  autoRows: "auto",
};

ToolkitGridLayoutBorder.argTypes = {
  display: {
    options: ["grid", "inline-grid"],
    control: { type: "radio" },
  },
  justifyItems: {
    options: GRID_ALIGNMENT_BASE,
    control: { type: "select" },
  },
  alignItems: {
    options: [...GRID_ALIGNMENT_BASE, "baseline"],
    control: { type: "select" },
  },
  justifyContent: {
    options: GRID_LAYOUT_CONTENT_ALIGNMENT,
    control: { type: "select" },
  },
  alignContent: {
    options: GRID_LAYOUT_CONTENT_ALIGNMENT,
    control: { type: "select" },
  },
};

const headerStyles: CSSProperties = {
  color: "#84878E",
  fontWeight: 600,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
};
const textStyles = { color: "#74777F" };
const copyrightStyles = {
  color: "#84878E",
  borderTop: "1px solid #D9DDE3",
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
      <GridItem colSpan={2} align="center" justify="center">
        <Logo src={PlaceholderLogo} appTitle="Toolkit" />
        <p style={textStyles}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </GridItem>
      {footerColumns}
      <GridItem colSpan={6} style={copyrightStyles}>
        <FlexLayout alignItems="center" justifyContent="center">
          <p>© 2022 BrandName All rights reserved.</p>
        </FlexLayout>
      </GridItem>
    </GridLayout>
  );
};
export const ToolkitGridLayoutFooter = Footer.bind({});
ToolkitGridLayoutFooter.args = {
  display: "grid",
  columns: 6,
  columnGap: "3rem",
  rowGap: "1rem",
  justifyItems: "stretch",
  alignItems: "stretch",
  justifyContent: "stretch",
  alignContent: "stretch",
  autoColumns: "auto",
  autoRows: "auto",
};

ToolkitGridLayoutFooter.argTypes = {
  display: {
    options: ["grid", "inline-grid"],
    control: { type: "radio" },
  },
  justifyItems: {
    options: GRID_ALIGNMENT_BASE,
    control: { type: "select" },
  },
  alignItems: {
    options: [...GRID_ALIGNMENT_BASE, "baseline"],
    control: { type: "select" },
  },
  justifyContent: {
    options: GRID_LAYOUT_CONTENT_ALIGNMENT,
    control: { type: "select" },
  },
  alignContent: {
    options: GRID_LAYOUT_CONTENT_ALIGNMENT,
    control: { type: "select" },
  },
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
        <FlexLayout alignItems="center">
          <FlexItem style={{ marginRight: "1em" }}>
            <Avatar children="ABC" size="large" />
          </FlexItem>
          <FlexItem>Lorem Ipsum</FlexItem>
        </FlexLayout>
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
  display: "grid",
  columns: 3,
  columnGap: "8rem",
  rowGap: "1rem",
  justifyItems: "stretch",
  alignItems: "stretch",
  justifyContent: "stretch",
  alignContent: "stretch",
  autoColumns: "auto",
  autoRows: "auto",
};

ToolkitGridLayoutBlog.argTypes = {
  display: {
    options: ["grid", "inline-grid"],
    control: { type: "radio" },
  },
  justifyItems: {
    options: GRID_ALIGNMENT_BASE,
    control: { type: "select" },
  },
  alignItems: {
    options: [...GRID_ALIGNMENT_BASE, "baseline"],
    control: { type: "select" },
  },
  justifyContent: {
    options: GRID_LAYOUT_CONTENT_ALIGNMENT,
    control: { type: "select" },
  },
  alignContent: {
    options: GRID_LAYOUT_CONTENT_ALIGNMENT,
    control: { type: "select" },
  },
};
