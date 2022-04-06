import {
  Card,
  Carousel,
  DeckLayout,
  Dropdown,
  FlexItem,
  FlexLayout,
  FormField,
  GridItem,
  StackLayout,
  Tabstrip,
  GridLayoutProps,
  Viewport,
} from "@brandname/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { useState } from "react";
import { PanelledSecurityMetrics } from "./panelled-layout.stories";
import { Development } from "../query-input.stories";
import { MetricsFlowLayout } from "./flow-layout.stories";
import { ToolkitGridLayoutBlog } from "./grid-layout.stories";
import { ToolkitParentChildLayoutResponsive } from "./parent-child-layout.stories";

export default {
  title: "Layout/DeckLayout",
  component: DeckLayout,
} as ComponentMeta<typeof DeckLayout>;

const gridItemStyles = {
  padding: "1rem",
  alignItems: "center",
  justifyContent: "center",
  background: "lightcyan",
};
const gridLayoutStyle = {
  background: "lightblue",
};
export const Template: ComponentStory<typeof DeckLayout> = (args) => {
  const [currentIndex, setCurrentIndex] = useState(10);

  const handleIncrease = () => {
    console.log("up");
    setCurrentIndex(currentIndex + 1);
  };
  const handleDecrease = () => {
    console.log("down");
    setCurrentIndex(currentIndex - 1);
  };
  return (
    <>
      <button onClick={handleIncrease}>Slide Up</button>
      <button onClick={handleDecrease}>Slide Down</button>
      <DeckLayout style={gridLayoutStyle} {...args} activeIndex={currentIndex}>
        {Array.from({ length: 12 }, (_, index) => (
          <div
            style={{
              ...gridItemStyles,
            }}
            key={index}
          >
            <h2>{`GridItem ${index + 1}`}</h2>
            <p>
              We can implement your cross-border liquidity model in just a few
              months, depending on the options, scope and complexity.
            </p>
          </div>
        ))}
      </DeckLayout>
    </>
  );
};
export const ToolkitDeckLayout = Template.bind({});
ToolkitDeckLayout.args = {
  animation: "slide",
  direction: "vertical",
};

ToolkitDeckLayout.argTypes = {
  animation: {
    options: ["slide", "fade"],
    control: { type: "radio" },
  },
  direction: {
    options: ["vertical", "horizontal"],
    control: { type: "radio" },
  },
};

const useTabSelection = (initialValue?: any) => {
  const [selectedTab, setSelectedTab] = useState(initialValue ?? 0);
  const handleTabSelection = (tabIndex: number) => {
    setSelectedTab(tabIndex);
  };
  return [selectedTab, handleTabSelection];
};

const WithTabStrip: ComponentStory<typeof DeckLayout> = (args) => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const blogProps: GridLayoutProps = {
    columns: 3,
    columnGap: "8rem",
    rowGap: "1rem",
    justifyItems: "stretch",
    alignItems: "stretch",
    justifyContent: "stretch",
    alignContent: "stretch",
  };
  const tabs = ["Home", "Transactions", "FX", "Security Center", "Blog"];
  return (
    <div>
      <Tabstrip onChange={handleTabSelection} defaultTabs={tabs} />
      <DeckLayout {...args} activeIndex={selectedTab}>
        <ToolkitParentChildLayoutResponsive
          parent={[]}
          child={[]}
          stackedAtBreakpoint={Viewport.SMALL}
        />
        <MetricsFlowLayout />
        <InVerticalTabStrip />
        <PanelledSecurityMetrics title={"Security Center"} />

        <ToolkitGridLayoutBlog {...blogProps} />
      </DeckLayout>
    </div>
  );
};
export const InTabstrip = WithTabStrip.bind({});
InTabstrip.args = {
  animation: undefined,
  direction: "vertical",
};

InTabstrip.argTypes = {
  animation: {
    options: ["slide", "fade"],
    control: { type: "radio" },
  },
  direction: {
    options: ["vertical", "horizontal"],
    control: { type: "radio" },
  },
};

const WithVerticalTabStrip: ComponentStory<typeof DeckLayout> = (args) => {
  const [selectedTab, handleTabSelection] = useTabSelection();
  const tabs = ["Profile", "Trading Controls", "Audit Trails"];
  const limitsData = ["ABC", "DEF", "FX"];
  return (
    <FlexLayout direction={"row"} wrap={"nowrap"} style={{ padding: "1rem 0" }}>
      <Tabstrip
        onChange={handleTabSelection}
        orientation="vertical"
        defaultTabs={tabs}
        style={{ flexShrink: "0" }}
      />
      <DeckLayout {...args} activeIndex={selectedTab}>
        {tabs.map((i, index) => (
          <StackLayout style={{ padding: "1rem 2rem" }} key={index}>
            <h2>{tabs[index]}</h2>
            <div>
              <p>
                <strong>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                </strong>
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ad,
                adipisci alias cum doloremque dolores ducimus eius fugiat.
              </p>
            </div>
            <div style={{ maxWidth: "250px" }}>
              <FormField label="View limits" labelPlacement="left">
                <Dropdown
                  initialSelectedItem={limitsData[2]}
                  source={limitsData}
                />
              </FormField>
            </div>

            <FlexLayout colGap={"2rem"}>
              <FlexItem>
                <h3>FX - Spot</h3>
                <Development showCategory autoClose />
              </FlexItem>
              <GridItem>
                <h3>FX - Forward</h3>
                <Development showCategory autoClose />
              </GridItem>
              <GridItem>
                <h3>FX - Forward</h3>
                <Development showCategory autoClose />
              </GridItem>
            </FlexLayout>
          </StackLayout>
        ))}
      </DeckLayout>
    </FlexLayout>
  );
};
export const InVerticalTabStrip = WithVerticalTabStrip.bind({});

const colors = ["fcd5ce", "f8edeb", "d8e2dc", "ffe5d9", "ffd7ba"];
const WithCarousel: ComponentStory<typeof DeckLayout> = (args) => {
  return (
    <Carousel {...args}>
      {Array.from({ length: 5 }, (_, index) => (
        <Card key={index}>
          <img
            alt="placeholder slider"
            src={`https://via.placeholder.com/1140x520/${
              colors[index]
            }?text=Carousel+Slide+${index + 1}`}
            style={{ width: "100%" }}
          />
          <h4>Lorem ipsum dolor sit amet</h4>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto
            at atque cum doloribus fugiat in iste magnam natus nobis.
          </p>
        </Card>
      ))}
    </Carousel>
  );
};
export const CarouselWithDeckLayout = WithCarousel.bind({});
CarouselWithDeckLayout.args = {
  animation: undefined,
  direction: "horizontal",
};

CarouselWithDeckLayout.argTypes = {
  animation: {
    options: ["slide", "fade"],
    control: { type: "radio" },
  },
  direction: {
    options: ["vertical", "horizontal"],
    control: { type: "radio" },
  },
};
