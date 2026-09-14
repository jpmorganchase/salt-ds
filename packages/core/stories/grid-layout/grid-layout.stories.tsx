import {
  Button,
  FlowLayout,
  GridItem,
  GridLayout,
  H1,
  H2,
  H3,
  SaltProvider,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { ThumbsUpIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import "../layout/layout.stories.css";

export default {
  title: "Core/Layout/Grid Layout",
  component: GridLayout,
  subcomponents: { GridItem },
  argTypes: {
    as: { type: "string" },
    columnGap: { type: "number" },
    columns: { type: "number" },
    gap: {
      type: "number",
    },
    rowGap: { type: "number" },
    rows: { type: "number" },
  },
} as Meta<typeof GridLayout>;

const customBreakpoints = { xs: 0, sm: 450, md: 450, lg: 700, xl: 700 };

const Template: StoryFn<typeof GridLayout> = (args) => {
  return (
    <GridLayout {...args} className="layout-container">
      {Array.from({ length: 12 }, (_, index) => (
        <div key={index}>
          <Text>{`Item ${index + 1}`}</Text>
        </div>
      ))}
    </GridLayout>
  );
};
export const Default = Template.bind({});
Default.args = {
  columns: { xs: 1, sm: 3, md: 6, lg: 9, xl: 12 },
};
const PaddingAndMargins: StoryFn<typeof GridLayout> = (args) => {
  return (
    <div className="spacing-example-margin">
      <GridLayout className="spacing-example-padding" {...args}>
        {Array.from({ length: 12 }, (_, index) => (
          <GridItem
            className="spacing-example-gap"
            key={`item-${index + 1}`}
            padding={1}
          >
            <Text>Item {index + 1}</Text>
          </GridItem>
        ))}
      </GridLayout>
    </div>
  );
};
export const WithPaddingAndMargins = PaddingAndMargins.bind({});
WithPaddingAndMargins.args = {
  wrap: false,
  gap: 1,
  padding: 2,
  margin: 2,
};
const ResponsiveView: StoryFn<typeof GridLayout> = (args) => {
  return (
    <SaltProvider breakpoints={customBreakpoints}>
      <GridLayout {...args} className="layout-container custom-breaks">
        <GridItem colSpan={{ xs: 1, md: 6, lg: 9 }}>
          <Text>GridItem 1</Text>
        </GridItem>

        {Array.from({ length: 6 }, (_, index) => (
          <GridItem
            key={index}
            colSpan={{ xs: 1, md: 3 }}
            rowSpan={{ md: 2, lg: 1 }}
          >
            <Text>{`Item ${index + 2}`}</Text>
          </GridItem>
        ))}
        <GridItem colSpan={{ xs: 1, md: 6, lg: 9 }}>
          <Text>GridItem 8</Text>
        </GridItem>
      </GridLayout>
    </SaltProvider>
  );
};

export const ResponsiveViewWithCustomBreakpoints = ResponsiveView.bind({});
ResponsiveViewWithCustomBreakpoints.args = {
  columns: { xs: 1, md: 6, lg: 12 },
  rows: { md: 8, lg: 3 },
};

const footerLinks: Record<string, string[]> = {
  Solutions: ["Marketing", "Analytics", "Commerce", "Insights"],
  Support: ["Pricing", "Documentation", "Guides", "API Status"],
  Company: ["About", "Blog", "Jobs", "Press", "Partners"],
  Legal: ["Claim", "Privacy", "Terms"],
};

const footerColumns = Object.keys(footerLinks).map((header) => (
  <StackLayout key={header} className="footer-column" gap={1}>
    <H3 color="secondary">
      <strong>{header}</strong>
    </H3>
    {footerLinks[header].map((link: string) => (
      <Text color="secondary" key={link}>
        {link}
      </Text>
    ))}
  </StackLayout>
));

const FooterTemplate: StoryFn<typeof GridLayout> = (args) => {
  return (
    <GridLayout {...args}>
      <GridItem
        colSpan={2}
        horizontalAlignment="center"
        verticalAlignment="center"
        className="footer-column"
      >
        <StackLayout gap={1}>
          <H3 color="secondary">
            <strong>Logo | Salt</strong>
          </H3>
          <Text as="p" color="secondary">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Text>
        </StackLayout>
      </GridItem>
      {footerColumns}
      <GridItem colSpan={{ xs: 2, md: 6 }} className="copy-right">
        <Text as="p" color="secondary">
          © 2022 BrandName All rights reserved.
        </Text>
      </GridItem>
    </GridLayout>
  );
};
export const Footer = FooterTemplate.bind({});
Footer.args = {
  columnGap: { xs: 2, md: 8 },
  columns: { xs: 1, sm: 2, md: 6 },
};

const renderArticleButtons = (
  <FlowLayout gap={1}>
    <Button>Save to reading list</Button>
    <Button>Share</Button>
    <Button aria-label="like">
      <ThumbsUpIcon />
    </Button>
  </FlowLayout>
);
const Blog: StoryFn<typeof GridLayout> = (args) => {
  return (
    <div className="grid-blog-container">
      <GridLayout {...args}>
        <GridItem as="section" colSpan={{ xs: 1, sm: 2, md: 2, lg: 4, xl: 4 }}>
          <StackLayout gap={2}>
            <H1>
              Featured blog post of the week: Lorem ipsum dolor sit amet,
              consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
              labore.
            </H1>
            <div className="grid-blog-featured" />
          </StackLayout>
        </GridItem>

        <GridItem as="article" colSpan={{ xs: 1, lg: 2 }}>
          <StackLayout gap={2}>
            <H2>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            </H2>
            <div className="grid-blog-medium-image grid-blog-image-one" />
            <Text as="p">
              Ut enim ad minima veniam, quis nostrum exercitationem ullam
              corporis suscipit laboriosam, nisi ut aliquid ex ea commodi
              consequatur?
            </Text>
            {renderArticleButtons}
          </StackLayout>
        </GridItem>

        <GridItem as="article" colSpan={{ xs: 1, lg: 2 }}>
          <StackLayout gap={2}>
            <H2>Nemo enim ipsam voluptatem quia voluptas sit aspernatur</H2>
            <div className="grid-blog-medium-image grid-blog-image-two" />
            <Text as="p">
              At vero eos et accusamus et iusto odio dignissimos ducimus qui
              blanditiis praesentium voluptatum deleniti atque corrupti quos
              dolores et quas molestias excepturi sint occaecati cupiditate non
              provident, similique sunt in culpa qui officia deserunt mollitia
              animi.
            </Text>
            {renderArticleButtons}
          </StackLayout>
        </GridItem>
        <StackLayout as="article" gap={2}>
          <H3>At vero eos et accusamus et iusto odio dignissimos ducimus</H3>
          <div className="grid-blog-small-image grid-blog-image-three" />
          <Text as="p">
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
          </Text>
          {renderArticleButtons}
        </StackLayout>

        <StackLayout as="article" gap={2}>
          <H3>At vero eos et accusamus et iusto odio dignissimos ducimus</H3>
          <div className="grid-blog-small-image grid-blog-image-four" />
          <Text as="p">
            Enim sit excepteur incididunt et excepteur. Est incididunt enim
            tempor labore ad. Sit reprehenderit nulla mollit ad sunt pariatur
            nostrud cupidatat eu sint officia nulla esse. Veniam enim est irure
            est est aliquip nisi enim veniam occaecat.
          </Text>
          {renderArticleButtons}
        </StackLayout>
        <StackLayout as="article" gap={2}>
          <H3>At vero eos et accusamus et iusto odio dignissimos ducimus</H3>
          <div className="grid-blog-small-image grid-blog-image-five" />
          <Text as="p">
            Nostrud labore non aliqua dolore esse ullamco excepteur eu et. Nisi
            labore nulla anim in non proident nisi labore sint enim exercitation
            fugiat pariatur enim. Cillum est labore in labore labore culpa id.
            Consectetur ut enim eiusmod aliqua eu eiusmod sit.
          </Text>
          {renderArticleButtons}
        </StackLayout>
        <StackLayout as="article" gap={2}>
          <H3>At vero eos et accusamus et iusto odio dignissimos ducimus</H3>
          <div className="grid-blog-small-image grid-blog-image-six" />
          <Text as="p">
            Voluptate elit sit id consectetur sit reprehenderit minim mollit do.
            Aliquip exercitation sunt esse voluptate laborum. Occaecat dolor
            minim dolore in excepteur sint.
          </Text>
          {renderArticleButtons}
        </StackLayout>
      </GridLayout>
    </div>
  );
};
export const Composite = Blog.bind({});
Composite.args = {
  as: "main",
  columns: { xs: 1, sm: 2, lg: 4 },
};

const GridLayoutNestedExample: StoryFn<typeof GridLayout> = () => {
  return (
    <GridLayout columnGap={6} columns={2}>
      <div className="layout-content">Item 1</div>
      <GridLayout rows={2} columns={1} className="layout-container">
        <div>Item 1</div>
        <div>Item 2</div>
      </GridLayout>
    </GridLayout>
  );
};
export const Nested = GridLayoutNestedExample.bind({});
Nested.args = {};

export const ColumnTemplate = Template.bind({});
ColumnTemplate.args = {
  columns: "1fr auto 200px",
};
