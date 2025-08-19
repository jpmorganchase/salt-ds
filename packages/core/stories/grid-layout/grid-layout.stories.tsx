import {
  Button,
  FlowLayout,
  GridItem,
  GridLayout,
  SaltProvider,
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
          <p>{`Item ${index + 1}`}</p>
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
            <p>Item {index + 1}</p>
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
          <p>GridItem 1</p>
        </GridItem>

        {Array.from({ length: 6 }, (_, index) => (
          <GridItem
            key={index}
            colSpan={{ xs: 1, md: 3 }}
            rowSpan={{ md: 2, lg: 1 }}
          >
            <p>{`Item ${index + 2}`}</p>
          </GridItem>
        ))}
        <GridItem colSpan={{ xs: 1, md: 6, lg: 9 }}>
          <p>GridItem 8</p>
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
  <div key={header} className="footer-column">
    <p>{header}</p>
    {footerLinks[header].map((link: string) => (
      <p key={link}>{link}</p>
    ))}
  </div>
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
        <p>Logo | Salt</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </GridItem>
      {footerColumns}
      <GridItem colSpan={{ xs: 2, md: 6 }} className="copy-right">
        <p>© 2022 BrandName All rights reserved.</p>
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
          <h1>
            Featured blog post of the week: Lorem ipsum dolor sit amet,
            consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
            labore.
          </h1>
          <div className="grid-blog-featured" />
        </GridItem>

        <GridItem as="article" colSpan={{ xs: 1, lg: 2 }}>
          <h2>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
          </h2>
          <div className="grid-blog-medium-image grid-blog-image-one" />
          <p>
            Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis
            suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?
          </p>
          {renderArticleButtons}
        </GridItem>

        <GridItem as="article" colSpan={{ xs: 1, lg: 2 }}>
          <h2>Nemo enim ipsam voluptatem quia voluptas sit aspernatur</h2>
          <div className="grid-blog-medium-image grid-blog-image-two" />
          <p>
            At vero eos et accusamus et iusto odio dignissimos ducimus qui
            blanditiis praesentium voluptatum deleniti atque corrupti quos
            dolores et quas molestias excepturi sint occaecati cupiditate non
            provident, similique sunt in culpa qui officia deserunt mollitia
            animi.
          </p>
          {renderArticleButtons}
        </GridItem>
        <article>
          <h3>At vero eos et accusamus et iusto odio dignissimos ducimus</h3>
          <div className="grid-blog-small-image grid-blog-image-three" />
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
          </p>
          {renderArticleButtons}
        </article>

        <article>
          <h3>At vero eos et accusamus et iusto odio dignissimos ducimus</h3>
          <div className="grid-blog-small-image grid-blog-image-four" />
          <p>
            Enim sit excepteur incididunt et excepteur. Est incididunt enim
            tempor labore ad. Sit reprehenderit nulla mollit ad sunt pariatur
            nostrud cupidatat eu sint officia nulla esse. Veniam enim est irure
            est est aliquip nisi enim veniam occaecat.
          </p>
          {renderArticleButtons}
        </article>
        <article>
          <h3>At vero eos et accusamus et iusto odio dignissimos ducimus</h3>
          <div className="grid-blog-small-image grid-blog-image-five" />
          <p>
            Nostrud labore non aliqua dolore esse ullamco excepteur eu et. Nisi
            labore nulla anim in non proident nisi labore sint enim exercitation
            fugiat pariatur enim. Cillum est labore in labore labore culpa id.
            Consectetur ut enim eiusmod aliqua eu eiusmod sit.
          </p>
          {renderArticleButtons}
        </article>
        <article>
          <h3>At vero eos et accusamus et iusto odio dignissimos ducimus</h3>
          <div className="grid-blog-small-image grid-blog-image-six" />
          <p>
            Voluptate elit sit id consectetur sit reprehenderit minim mollit do.
            Aliquip exercitation sunt esse voluptate laborum. Occaecat dolor
            minim dolore in excepteur sint.
          </p>
          {renderArticleButtons}
        </article>
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
