import { CSSProperties } from "react";
import {
  Card,
  GridLayout,
  GridItem,
  StackLayout,
  FormField,
  FlowLayout,
} from "@jpmorganchase/uitk-core";
import {
  Dropdown,
  ButtonBar,
  OrderedButton,
  ContactAvatar,
  ContactDetails,
  ContactMetadata,
  ContactMetadataItem,
  ContactPrimaryInfo,
  ContactSecondaryInfo,
  ContactTertiaryInfo,
} from "@jpmorganchase/uitk-lab";
import {
  ToolkitProvider,
  FlexLayout,
  FlexItem,
  Pill,
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

const sidebar = (
  <FlowLayout>
    {Array.from({ length: 4 }, (_, index) => (
      <FlexItem key={index} grow={1}>
        <Card>
          <ContactDetails embedded={true} stackAtBreakpoint={0}>
            <ContactAvatar />
            <ContactPrimaryInfo text="Allamco Adipisicing" />
            <ContactSecondaryInfo text="Editorial contributor" />
            <ContactTertiaryInfo text="Cupidatat Elit" />
            <ContactMetadata collapsible={true}>
              <ContactMetadataItem value="Editorial contributor" label="Role" />
              <ContactMetadataItem value="London, GBR" label="Location" />
              <ContactMetadataItem value="+44 1234 123456" label="Office" />
              <ContactMetadataItem
                value="laboris.elit@aliquip.com"
                label="Email"
              />
            </ContactMetadata>
          </ContactDetails>
        </Card>
      </FlexItem>
    ))}
  </FlowLayout>
);

const Blog: ComponentStory<typeof GridLayout> = (args) => {
  return (
    <div className="grid-blog-container">
      <GridLayout {...args}>
        <GridItem colSpan={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 3 }}>
          <h1>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </h1>
          <div className="grid-blog-hero" />
        </GridItem>

        <GridItem colSpan={1}>
          <h2>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
          </h2>
          <div className="grid-blog-image grid-blog-image-one" />
          <p>
            Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis
            suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?
          </p>
          <FlowLayout gap={1}>
            {Array.from({ length: 5 }, (_, index) => (
              <Pill label="Lorem" key={index} />
            ))}
          </FlowLayout>
        </GridItem>

        <GridItem colSpan={1}>
          <h2>Nemo enim ipsam voluptatem quia voluptas sit aspernatur</h2>
          <div className="grid-blog-image grid-blog-image-two" />
          <p>
            At vero eos et accusamus et iusto odio dignissimos ducimus qui
            blanditiis praesentium voluptatum deleniti atque corrupti quos
            dolores et quas molestias excepturi sint occaecati cupiditate non
            provident, similique sunt in culpa qui officia deserunt mollitia
            animi.
          </p>
          <FlowLayout gap={1}>
            {Array.from({ length: 3 }, (_, index) => (
              <Pill label="Lorem" key={index} />
            ))}
          </FlowLayout>
        </GridItem>
        <GridItem colSpan={{ xs: 1, sm: 1, md: 2, lg: 1, xl: 1 }}>
          <h2>At vero eos et accusamus et iusto odio dignissimos ducimus</h2>
          <div className="grid-blog-image grid-blog-image-three" />
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
          </p>
          <FlowLayout gap={1}>
            {Array.from({ length: 4 }, (_, index) => (
              <Pill label="Lorem" key={index} />
            ))}
          </FlowLayout>
        </GridItem>

        <GridItem colSpan={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 3 }}>
          <h2>Editorial content contributors</h2>
          {sidebar}
        </GridItem>
      </GridLayout>
    </div>
  );
};
export const ToolkitGridLayoutBlog = Blog.bind({});
ToolkitGridLayoutBlog.args = {
  columns: { xs: 1, sm: 1, md: 2, lg: 3, xl: 3 },
};

const dropdownExampleData = [
  "Lorem ipsum dolor",
  "Commodo laboris",
  "Ipsum incididunt",
];

const Dashboard: ComponentStory<typeof GridLayout> = (args) => {
  return (
    <GridLayout
      className="grid-layout-container"
      columns={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 3 }}
      rows={3}
      {...args}
    >
      <GridItem rowSpan={3} colSpan={1}>
        <Card>
          <StackLayout>
            {Array.from({ length: 6 }, (_, index) => (
              <ContactDetailsExample key={index} index={index} />
            ))}
          </StackLayout>
        </Card>
      </GridItem>
      <GridItem rowSpan={3} colSpan={1}>
        <Card>
          <StackLayout>
            {Array.from({ length: 4 }, (_, index) => (
              <MetricExample key={index} />
            ))}
          </StackLayout>
        </Card>
      </GridItem>
      <GridItem rowSpan={3} colSpan={1}>
        <Card>
          <StackLayout>
            {Array.from({ length: 7 }, (_, index) => (
              <FormField
                label="Preference 1"
                helperText="Help text appears here"
                key={index}
              >
                <Dropdown
                  initialSelectedItem={dropdownExampleData[0]}
                  source={dropdownExampleData}
                />
              </FormField>
            ))}
            <ButtonBar>
              <OrderedButton variant="cta">Save</OrderedButton>
              <OrderedButton>Cancel</OrderedButton>
            </ButtonBar>
          </StackLayout>
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
