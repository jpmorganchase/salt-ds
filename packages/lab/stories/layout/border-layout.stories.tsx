import { useState } from "react";
import {
  BorderLayout,
  BorderItem,
  Card,
  FlexLayout,
  FlexItem,
  Tabstrip,
  Tab,
  List,
  ListItem,
  SplitLayout,
  StackLayout,
} from "@brandname/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { HeaderWithSplitLayout } from "./split-layout.stories";
import { Button, TearOutIcon } from "@brandname/core";
import { InTabstrip } from "./deck-layout.stories";

export default {
  title: "Layout/BorderLayout",
  component: BorderLayout,
} as ComponentMeta<typeof BorderLayout>;

const borderItemStyles = {
  padding: "1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const areaColors = {
  main: "#cf4d6f",
  left: "#cc7e85",
  header: "#c5afa4",
  right: "#a36d90",
  bottom: "#76818e",
};

const { main, left, header, right, bottom } = areaColors;

const Template: ComponentStory<typeof BorderLayout> = (args) => {
  return (
    <BorderLayout {...args}>
      <BorderItem
        position="header"
        style={{ ...borderItemStyles, backgroundColor: header }}
      >
        <p>Header</p>
      </BorderItem>
      <BorderItem
        position="left"
        style={{ ...borderItemStyles, backgroundColor: left }}
      >
        <p>Left</p>
      </BorderItem>
      <BorderItem
        position="main"
        style={{
          ...borderItemStyles,
          backgroundColor: main,
          minWidth: 100,
        }}
      >
        <p>Main</p>
      </BorderItem>
      <BorderItem
        position="right"
        style={{ ...borderItemStyles, backgroundColor: right }}
      >
        <p>Right</p>
      </BorderItem>
      <BorderItem
        position="bottom"
        style={{ ...borderItemStyles, backgroundColor: bottom }}
      >
        <p>Bottom</p>
      </BorderItem>
    </BorderLayout>
  );
};

export const ToolkitBorderLayout = Template.bind({});
ToolkitBorderLayout.args = {
  columnGap: 0,
  rowGap: 0,
};

ToolkitBorderLayout.argTypes = {};

const NoRightPanel: ComponentStory<typeof BorderLayout> = (args) => {
  return (
    <BorderLayout {...args}>
      <BorderItem
        position="header"
        style={{ ...borderItemStyles, backgroundColor: header }}
      >
        <p>Header</p>
      </BorderItem>
      <BorderItem
        position="left"
        style={{ ...borderItemStyles, backgroundColor: left }}
      >
        <p>Left</p>
      </BorderItem>
      <BorderItem
        position="main"
        style={{
          ...borderItemStyles,
          backgroundColor: main,
          minWidth: 100,
        }}
      >
        <p>Main</p>
      </BorderItem>
      <BorderItem
        position="bottom"
        style={{ ...borderItemStyles, backgroundColor: bottom }}
      >
        <p>Bottom</p>
      </BorderItem>
    </BorderLayout>
  );
};

export const ToolkitBorderLayoutNoRightPanel = NoRightPanel.bind({});
ToolkitBorderLayoutNoRightPanel.args = {
  columnGap: 0,
  rowGap: 0,
};

ToolkitBorderLayoutNoRightPanel.argTypes = {};

const NoLeftPanel: ComponentStory<typeof BorderLayout> = (args) => {
  return (
    <BorderLayout {...args}>
      <BorderItem
        position="header"
        style={{ ...borderItemStyles, backgroundColor: header }}
      >
        <p>Header</p>
      </BorderItem>
      <BorderItem
        position="main"
        style={{
          ...borderItemStyles,
          backgroundColor: main,
          minWidth: 100,
        }}
      >
        <p>Main</p>
      </BorderItem>
      <BorderItem
        position="right"
        style={{ ...borderItemStyles, backgroundColor: right }}
      >
        <p>Right</p>
      </BorderItem>
      <BorderItem
        position="bottom"
        style={{ ...borderItemStyles, backgroundColor: bottom }}
      >
        <p>Bottom</p>
      </BorderItem>
    </BorderLayout>
  );
};

export const ToolkitBorderLayoutNoLeftPanel = NoLeftPanel.bind({});
ToolkitBorderLayoutNoLeftPanel.args = {
  columnGap: 0,
  rowGap: 0,
};

ToolkitBorderLayoutNoLeftPanel.argTypes = {};

const NoHeader: ComponentStory<typeof BorderLayout> = (args) => {
  return (
    <BorderLayout {...args}>
      <BorderItem
        position="left"
        style={{ ...borderItemStyles, backgroundColor: left }}
      >
        <p>Left</p>
      </BorderItem>
      <BorderItem
        position="main"
        style={{
          ...borderItemStyles,
          backgroundColor: main,
          minWidth: 100,
        }}
      >
        <p>Main</p>
      </BorderItem>
      <BorderItem
        position="right"
        style={{ ...borderItemStyles, backgroundColor: right }}
      >
        <p>Right</p>
      </BorderItem>
      <BorderItem
        position="bottom"
        style={{ ...borderItemStyles, backgroundColor: bottom }}
      >
        <p>Bottom</p>
      </BorderItem>
    </BorderLayout>
  );
};

export const ToolkitBorderLayoutNoHeader = NoHeader.bind({});
ToolkitBorderLayoutNoHeader.args = {
  columnGap: 0,
  rowGap: 0,
};

ToolkitBorderLayoutNoHeader.argTypes = {};

const FixedPanels: ComponentStory<typeof BorderLayout> = (args) => {
  return (
    <BorderLayout {...args} style={{ width: "80vw" }}>
      <BorderItem
        position="header"
        height={50}
        style={{ ...borderItemStyles, backgroundColor: header }}
      >
        <p>Header</p>
      </BorderItem>
      <BorderItem
        position="left"
        width={100}
        height={200}
        style={{ ...borderItemStyles, backgroundColor: left }}
      >
        <p>Left</p>
      </BorderItem>
      <BorderItem
        position="main"
        style={{
          ...borderItemStyles,
          backgroundColor: main,
        }}
      >
        <p>Main</p>
      </BorderItem>
      <BorderItem
        position="right"
        width={100}
        height={200}
        style={{ ...borderItemStyles, backgroundColor: right }}
      >
        <p>Right</p>
      </BorderItem>
      <BorderItem
        position="bottom"
        height={50}
        style={{ ...borderItemStyles, backgroundColor: bottom }}
      >
        <p>Bottom</p>
      </BorderItem>
    </BorderLayout>
  );
};

export const ToolkitBorderLayoutFixedPanels = FixedPanels.bind({});
ToolkitBorderLayoutFixedPanels.args = {
  columnGap: 0,
  rowGap: 0,
};

ToolkitBorderLayoutFixedPanels.argTypes = {};

const headings = [
  "Usage",
  "Interactions and behaviors",
  "Layout",
  "Responsiveness",
  "Accessibility",
  "Props",
];

const components = [
  "Accordion",
  "Announcement Dialog",
  "App Header",
  "Aria Announcer",
  "Avatar",
  "Badge",
  "Banner",
  "Breadcrumbs",
  "Button",
  "Button Bar",
  "Card",
  "Carousel",
  "Cascading Menu",
  "Chart",
  "Checkbox",
  "Code Block",
  "Column Layout",
  "Combo Box",
  "Comments",
  "Contact Details",
  "Content Status",
  "Context Menu",
  "Data Grid",
  "Date Picker",
  "Dialog",
  "Drawer",
  "Dropdown",
  "Experience Customization Wizard",
  "File Drop Zone",
  "Filterable List",
  "Flag",
  "Form Field",
  "Formatted Input",
  "Icon",
  "Input",
  "Link",
  "List",
  "List Builder",
  "Logo",
  "Mega Menu",
  "Menu Button",
  "Metric",
  "Overlay",
  "Pagination",
  "Panel",
  "Pill",
  "Preferences Dialog",
  "Progress",
  "Radio Button",
  "Rating",
  "Reorderable List",
  "Scrim",
  "Search",
  "Selectable Card",
  "Skip Link",
  "Slider",
  "Spinner",
  "Split Button",
  "Splitter",
  "Stepped Tracker",
  "Stepper Input",
  "Switch",
  "Tabs",
  "Tile",
  "Toast",
  "Toggle Button",
  "Tokenized Input",
  "Toolbar",
  "Toolbar Next",
  "Tooltip",
  "Tree",
  "Vertical Navigation",
  "Wizard",
];

const CustomCard = () => (
  <Card interactable>
    <img
      alt="placeholder image"
      src="https://via.placeholder.com/330x185?text=Image"
      style={{ width: "100%" }}
    />
    <h2>Lorem Ipsum</h2>
    <span>Aliqua deserunt eiusmod reprehenderit reprehenderit cillum.</span>
  </Card>
);

const useTabSelection = (initialValue?: any) => {
  const [selectedTab, setSelectedTab] = useState(initialValue ?? 0);
  const handleTabSelection = (tabIndex: number) => {
    setSelectedTab(tabIndex);
  };
  return [selectedTab, handleTabSelection];
};

const Page: ComponentStory<typeof BorderLayout> = (args) => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  return (
    <BorderLayout {...args}>
      <BorderItem
        position="header"
        height={44}
        sticky
        style={{
          paddingTop: 16,
          borderBottom: "solid 1px #C5C9D0",
          marginBottom: 50,
          backgroundColor: "#fff",
          zIndex: 1,
        }}
      >
        <HeaderWithSplitLayout separator="vertical-end" stretchedItem={0} />
      </BorderItem>
      <BorderItem
        position="left"
        height="calc(100vh - 160px)"
        sticky
        style={{ top: 110 }}
      >
        <Tabstrip onChange={handleTabSelection} orientation="vertical">
          {components.map((label, i) => (
            <Tab label={label} key={i} />
          ))}
        </Tabstrip>
      </BorderItem>
      <BorderItem position="main" style={{ padding: "0 4rem 2rem" }}>
        <h1>{components[selectedTab]}</h1>

        {headings.map((heading, index) => (
          <StackLayout
            key={index}
            id={heading}
            rowGap="2rem"
            style={{ scrollMarginTop: 110 }}
          >
            <h2>{heading}</h2>
            <FlexLayout>
              <FlexItem stretch={1}>
                <CustomCard />
              </FlexItem>
              <FlexItem stretch={1}>
                <CustomCard />
              </FlexItem>
            </FlexLayout>
            <p>
              Minim labore est dolore culpa eu ut esse proident ipsum ea ex id
              sit. Consectetur enim laboris enim veniam occaecat tempor
              incididunt excepteur elit velit. Ullamco cillum cillum sit
              pariatur voluptate dolore aliqua amet. Qui ex ad esse ex
              consequat.
            </p>
          </StackLayout>
        ))}
      </BorderItem>
      <BorderItem
        position="right"
        height="calc(100vh - 160px)"
        width={200}
        sticky
        style={{ top: 110 }}
      >
        <nav>
          <h3>On this page</h3>
          <List borderless>
            {headings.map((heading, index) => (
              <ListItem
                key={index}
                onClick={() => (location.href = `#${heading}`)}
              >
                {heading}
              </ListItem>
            ))}
          </List>
        </nav>
      </BorderItem>
      <BorderItem position="bottom">
        <FlexLayout alignItems="center" justifyContent="center">
          <p>© 2022 BrandName All rights reserved.</p>
        </FlexLayout>
      </BorderItem>
    </BorderLayout>
  );
};

export const ToolkitBorderLayoutPage = Page.bind({});
ToolkitBorderLayoutPage.args = {
  columnGap: 0,
  rowGap: 0,
};

ToolkitBorderLayoutPage.argTypes = {};

const MetricsExample: ComponentStory<typeof BorderLayout> = (args) => {
  return (
    <BorderLayout {...args}>
      <BorderItem position="header">
        <HeaderWithSplitLayout separator={"vertical-end"} stretchedItem={0} />
      </BorderItem>
      <BorderItem
        position="main"
        style={{
          ...borderItemStyles,
          minWidth: 100,
        }}
      >
        <InTabstrip />
      </BorderItem>
      <BorderItem position="bottom" style={{ margin: "0 1rem" }}>
        <SplitLayout style={{ height: "30px" }}>
          <p>© 2022 BrandName All rights reserved.</p>
          <div>
            <Button variant="secondary">Sitemap</Button>
            <Button variant="secondary">
              Security <TearOutIcon />
            </Button>{" "}
            <Button variant="secondary">
              Privacy <TearOutIcon />
            </Button>
            <Button variant="secondary">Contact Us</Button>
          </div>
        </SplitLayout>
      </BorderItem>
    </BorderLayout>
  );
};

export const ToolkitBorderLayoutMetricsExample = MetricsExample.bind({});
