import { CSSProperties } from "react";
import {
  Card,
  GridLayout,
  GridItem,
  StackLayout,
  FlowLayout,
} from "@jpmorganchase/uitk-core";
import { Avatar } from "@jpmorganchase/uitk-lab";
import {
  ToolkitProvider,
  FlexLayout,
  FlexItem,
} from "@jpmorganchase/uitk-core";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { ContactDetailsExample } from "./flex-layout.stories";
import { MetricExample } from "./flow-layout.stories";

export default {
  title: "Core/Layout/GridLayout",
  component: GridLayout,
  subcomponents: { GridItem },
} as ComponentMeta<typeof GridLayout>;

const Template: ComponentStory<typeof GridLayout> = (args) => {
  return (
    <GridLayout {...args}>
      {Array.from({ length: 12 }, (_, index) => (
        <GridItem key={index}>
          <div className="layout-content">
            <p>{`GridItem ${index + 1}`}</p>
          </div>
        </GridItem>
      ))}
    </GridLayout>
  );
};
export const ToolkitGridLayout = Template.bind({});
ToolkitGridLayout.args = {};

const DefaultGridLayoutStory: ComponentStory<typeof GridLayout> = (args) => {
  return (
    <GridLayout {...args}>
      {Array.from({ length: 12 }, (_, index) => (
        <GridItem key={index}>
          <div className="layout-content">
            <p>{`GridItem ${index + 1}`}</p>
          </div>
        </GridItem>
      ))}
    </GridLayout>
  );
};
export const ToolkitGridLayoutMultipleRows = DefaultGridLayoutStory.bind({});
ToolkitGridLayoutMultipleRows.args = {
  columns: 4,
  rows: 3,
};

const ResponsiveItem = ({ text }: { text: string }) => (
  <FlexLayout
    className="layout-content responsive-grid-item"
    align="center"
    justify="center"
  >
    <FlexItem>
      <p>{text}</p>
    </FlexItem>
  </FlexLayout>
);

const ResponsiveView: ComponentStory<typeof GridLayout> = (args) => {
  return (
    <GridLayout {...args}>
      <GridItem
        colSpan={{ xs: 1, sm: 1, md: 6, lg: 3, xl: 3 }}
        rowSpan={{ xs: 1, sm: 1, md: 2, lg: 1, xl: 1 }}
      >
        <ResponsiveItem text="GridItem 1" />
      </GridItem>
      <GridItem
        colSpan={{ xs: 1, sm: 1, md: 3, lg: 3, xl: 3 }}
        rowSpan={{ xs: 1, sm: 1, md: 4, lg: 1, xl: 1 }}
      >
        <ResponsiveItem text="GridItem 2" />
      </GridItem>
      <GridItem
        colSpan={{ xs: 1, sm: 1, md: 3, lg: 3, xl: 3 }}
        rowSpan={{ xs: 1, sm: 1, md: 4, lg: 1, xl: 1 }}
      >
        <ResponsiveItem text="GridItem 3" />
      </GridItem>
      <GridItem
        colSpan={{ xs: 1, sm: 1, md: 6, lg: 3, xl: 3 }}
        rowSpan={{ xs: 1, sm: 1, md: 2, lg: 1, xl: 1 }}
      >
        <ResponsiveItem text="GridItem 4" />
      </GridItem>
    </GridLayout>
  );
};
export const ToolkitGridLayoutResponsiveView = ResponsiveView.bind({});
ToolkitGridLayoutResponsiveView.args = {
  columns: { xs: 1, sm: 2, md: 12, lg: 12, xl: 12 },
  rows: { xs: 4, sm: 2, md: 4, lg: 1, xl: 1 },
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
      <GridLayout {...args}>
        <GridItem
          colSpan={{ xs: 1, sm: 1, md: 6, lg: 3, xl: 3 }}
          rowSpan={{ xs: 1, sm: 1, md: 2, lg: 1, xl: 1 }}
        >
          <ResponsiveItem text="GridItem 1" />
        </GridItem>
        <GridItem
          colSpan={{ xs: 1, sm: 1, md: 3, lg: 3, xl: 3 }}
          rowSpan={{ xs: 1, sm: 1, md: 4, lg: 1, xl: 1 }}
        >
          <ResponsiveItem text="GridItem 2" />
        </GridItem>
        <GridItem
          colSpan={{ xs: 1, sm: 1, md: 3, lg: 3, xl: 3 }}
          rowSpan={{ xs: 1, sm: 1, md: 4, lg: 1, xl: 1 }}
        >
          <ResponsiveItem text="GridItem 3" />
        </GridItem>
        <GridItem
          colSpan={{ xs: 1, sm: 1, md: 6, lg: 3, xl: 3 }}
          rowSpan={{ xs: 1, sm: 1, md: 2, lg: 1, xl: 1 }}
        >
          <ResponsiveItem text="GridItem 4" />
        </GridItem>
      </GridLayout>
    </ToolkitProvider>
  );
};
export const ToolkitGridLayoutCustomBreakpoints = CustomBreakpoints.bind({});
ToolkitGridLayoutCustomBreakpoints.args = {
  columns: { xs: 1, sm: 2, md: 12, lg: 12, xl: 12 },
  rows: { xs: 4, sm: 2, md: 4, lg: 1, xl: 1 },
};

const Border: ComponentStory<typeof GridLayout> = (args) => {
  return (
    <GridLayout {...args}>
      <GridItem colSpan={4}>
        <FlexLayout
          className="layout-content border-header"
          align="center"
          justify="center"
        >
          <p>Header</p>
        </FlexLayout>
      </GridItem>
      <GridItem colSpan={1}>
        <FlexLayout
          className="layout-content border-left"
          align="center"
          justify="center"
        >
          <p>Left</p>
        </FlexLayout>
      </GridItem>
      <GridItem colSpan={2}>
        <FlexLayout
          className="layout-content border-main"
          align="center"
          justify="center"
        >
          <p>Main</p>
        </FlexLayout>
      </GridItem>
      <GridItem colSpan={1}>
        <FlexLayout
          className="layout-content border-right"
          align="center"
          justify="center"
        >
          <p>Right</p>
        </FlexLayout>
      </GridItem>
      <GridItem colSpan={4}>
        <FlexLayout
          className="layout-content border-bottom"
          align="center"
          justify="center"
        >
          <p>Bottom</p>
        </FlexLayout>
      </GridItem>
    </GridLayout>
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
        <p>
          <strong>LOGO</strong> | Toolkit
        </p>
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
};

const cardText =
  "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aut, dicta impedit nemo nobis sed sunt. Consequuntur dignissimos, doloribus enim et hic incidunt, magnam mollitia nisi omnis quam rerum veniam veritatis?";

const Dashboard: ComponentStory<typeof GridLayout> = (args) => {
  return (
    <GridLayout
      {...args}
      rows={2}
      columns={3}
      className="grid-layout-container"
    >
      <GridItem rowSpan={2}>
        <h2>My contacts</h2>
        <Card>
          <StackLayout>
            {Array.from({ length: 6 }, (_, index) => (
              <ContactDetailsExample key={index} index={index} />
            ))}
          </StackLayout>
        </Card>
      </GridItem>
      <GridItem colSpan={2}>
        <h2>My preferences</h2>
        <FlowLayout>
          {Array.from({ length: 2 }, (_, index) => (
            <Card interactable key={index}>
              <Avatar />
              <p>{cardText}</p>
            </Card>
          ))}
        </FlowLayout>
      </GridItem>
      <GridItem colSpan={2}>
        <h2>My performance</h2>
        <Card>
          <FlowLayout gap={2}>
            {Array.from({ length: 10 }, (_, index) => (
              <MetricExample key={index} />
            ))}
          </FlowLayout>
        </Card>
      </GridItem>
    </GridLayout>
  );
};
export const GridLayoutComposite = Dashboard.bind({});
GridLayoutComposite.args = {};

const renderCards = (cardsNumber: number) => {
  return Array.from({ length: cardsNumber }, (_, index) => (
    <Card key={index} style={{ maxHeight: "150px", minWidth: "100px" }}>
      <p>{`Item ${index + 1}`}</p>
    </Card>
  ));
};

const GridLayoutNestedExample: ComponentStory<typeof GridLayout> = (args) => {
  return (
    <GridLayout columnGap={6} rows={2} columns={2}>
      {renderCards(2)}
      <GridLayout>{renderCards(2)}</GridLayout>
    </GridLayout>
  );
};
export const GridLayoutNested = GridLayoutNestedExample.bind({});
GridLayoutNested.args = {};
