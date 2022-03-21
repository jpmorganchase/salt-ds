import { useState } from "react";

import {
  ParentChildLayout,
  StackedViewElement,
  useIsStacked,
  Tabstrip,
  Tab,
  GridLayout,
  GridItem,
  Card,
  Avatar,
} from "@brandname/lab";
import { Button } from "@brandname/core";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import {DoubleChevronLeftIcon} from "@brandname/icons";

export default {
  title: "Layout/ParentChildLayout",
  component: ParentChildLayout,
} as ComponentMeta<typeof ParentChildLayout>;

const flexItemStyles = {
  background: "lightcyan",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
};
const flexLayoutStyle = {
  background: "lightblue",
  width: "90vw",
  height: 500,
};

const Template: ComponentStory<typeof ParentChildLayout> = (args) => {
  return (
    <ParentChildLayout style={flexLayoutStyle} {...args}>
      <div style={flexItemStyles}>
        <p>Parent</p>
      </div>
      <div style={flexItemStyles}>
        <p>Child</p>
      </div>
    </ParentChildLayout>
  );
};

export const ToolkitParentChildLayout = Template.bind({});
ToolkitParentChildLayout.args = { parentWidth: 200 };

ToolkitParentChildLayout.argTypes = {};

const Stacked: ComponentStory<typeof ParentChildLayout> = (args) => {
  const [currentView, setCurrentView] = useState<StackedViewElement>("parent");

  const handleParent = () => {
    setCurrentView("parent");
  };
  const handleChild = () => {
    setCurrentView("child");
  };

  return (
    <>
      <Button onClick={handleParent} disabled={currentView === "parent"}>
        Show parent
      </Button>
      <Button onClick={handleChild} disabled={currentView === "child"}>
        Show child
      </Button>
      <ParentChildLayout
        style={{ ...flexLayoutStyle, width: "50vw" }}
        stackedViewElement={currentView}
        {...args}
      >
        <div style={flexItemStyles}>
          <p>Parent</p>
        </div>
        <div style={flexItemStyles}>
          <p>Child</p>
        </div>
      </ParentChildLayout>
    </>
  );
};

export const ToolkitParentChildLayoutStacked = Stacked.bind({});
ToolkitParentChildLayoutStacked.args = {
  parentWidth: 200,
  stackedAtBreakpoint: 2000,
};

ToolkitParentChildLayoutStacked.argTypes = {};

const useTabSelection = (initialValue?: any) => {
  const [selectedTab, setSelectedTab] = useState(initialValue ?? 0);
  const handleTabSelection = (tabIndex: number) => {
    setSelectedTab(tabIndex);
  };
  return [selectedTab, handleTabSelection];
};

const cardText =
  "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aut, dicta impedit nemo nobis sed sunt. Consequuntur dignissimos, doloribus enim et hic incidunt, magnam mollitia nisi omnis quam rerum veniam veritatis?";

const tabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

const cardStyles = { height: "100%" };

const stackedAtBreakpoint = 700;

const Responsive: ComponentStory<typeof ParentChildLayout> = (args) => {
  const [selectedTab, handleTabSelection] = useTabSelection();

  const [currentView, setCurrentView] = useState<StackedViewElement>("parent");

  const isStacked = useIsStacked(stackedAtBreakpoint);

  const handleParent = () => {
    setCurrentView("parent");
  };
  const handleChild = () => {
    setCurrentView("child");
  };

  return (
    <ParentChildLayout
      stackedViewElement={currentView}
      style={{
        border: "solid 1px lightgrey",
        padding: 16,
        minWidth: "70vw",
      }}
      {...args}
    >
      <Tabstrip
        onChange={handleTabSelection}
        orientation="vertical"
        onClick={() => {
          if (isStacked) {
            handleChild();
          }
        }}
        value={selectedTab}
        style={{ width: "100%" }}
      >
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>

      <GridLayout rows={2} columns={5} columnGap="1em" rowGap="1em">
        <GridItem rowSpan={2} colSpan={1}>
          <Card
            style={{
              ...cardStyles,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h1>{tabs[selectedTab]}</h1>
            {isStacked && (
              <Button variant="cta" onClick={handleParent}>
                <DoubleChevronLeftIcon size={12} />
                {` Return`}
              </Button>
            )}
          </Card>
        </GridItem>

        <GridItem colSpan={2}>
          <Card style={cardStyles}>
            <Avatar />
            <p>{cardText}</p>
          </Card>
        </GridItem>
        <GridItem colSpan={2}>
          <Card style={cardStyles}>
            <Avatar />
            <p>{cardText}</p>
          </Card>
        </GridItem>
        <GridItem colSpan={4}>
          <Card style={cardStyles}>
            <Avatar />
            <p>{cardText}</p>
          </Card>
        </GridItem>
      </GridLayout>
    </ParentChildLayout>
  );
};

export const ToolkitParentChildLayoutResponsive = Responsive.bind({});
ToolkitParentChildLayoutResponsive.args = {
  stackedAtBreakpoint,
};

ToolkitParentChildLayoutResponsive.argTypes = {};
