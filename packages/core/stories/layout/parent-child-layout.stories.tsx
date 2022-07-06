import { useState } from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import { ChevronLeftIcon } from "@jpmorganchase/uitk-icons";
import { Tabstrip, Tab } from "@jpmorganchase/uitk-lab";
import {
  Button,
  ParentChildLayout,
  StackedViewElement,
  useIsViewportLargerThanBreakpoint,
  FlowLayout,
} from "@jpmorganchase/uitk-core";
import { DashboardExample } from "./flow-layout.stories";
import { SectionForm, Blog } from "./flex-layout.stories";

import "./styles.css";

export default {
  title: "Core/Layout/ParentChildLayout",
  component: ParentChildLayout,
  argTypes: {
    stackedAtBreakpoint: {
      control: { type: "select" },
    },
  },
} as ComponentMeta<typeof ParentChildLayout>;

const parentChildItemStyles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: 500,
};

const parent = (
  <div
    className="layout-content"
    style={{ ...parentChildItemStyles, minWidth: 150 }}
  >
    Parent
  </div>
);

const child = (
  <div className="layout-active-content" style={parentChildItemStyles}>
    Child
  </div>
);

const DefaultParentChildLayoutStory: ComponentStory<
  typeof ParentChildLayout
> = (args) => {
  return (
    <div style={{ width: "90vw", maxWidth: 800 }}>
      <ParentChildLayout {...args} />
    </div>
  );
};

export const DefaultParentChildLayout = DefaultParentChildLayoutStory.bind({});
DefaultParentChildLayout.args = { parent, child };

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
      <div style={{ width: "50vw", maxWidth: 800 }}>
        <ParentChildLayout
          {...args}
          stackedViewElement={currentView}
          parent={parent}
          child={child}
        />
      </div>
    </>
  );
};

export const ToolkitParentChildLayoutStacked = Stacked.bind({});
ToolkitParentChildLayoutStacked.args = {
  stackedAtBreakpoint: "xl",
};

const ReducedMotion: ComponentStory<typeof ParentChildLayout> = (args) => {
  const [currentView, setCurrentView] = useState<StackedViewElement>("parent");

  const handleParent = () => {
    setCurrentView("parent");
  };
  const handleChild = () => {
    setCurrentView("child");
  };

  return (
    <>
      <p>In order to test this on MacOS, follow these steps: </p>
      <p>
        Go to System Preferences, select the Accessibility category, select the
        Display tab, and enable the Reduce Motion option.
      </p>
      <Button onClick={handleParent} disabled={currentView === "parent"}>
        Show parent
      </Button>
      <Button onClick={handleChild} disabled={currentView === "child"}>
        Show child
      </Button>
      <div style={{ width: "50vw", maxWidth: 800 }}>
        <ParentChildLayout
          {...args}
          className="reduced-motion"
          stackedViewElement={currentView}
          parent={parent}
          child={child}
        />
      </div>
    </>
  );
};

export const ToolkitParentChildLayoutReducedMotion = ReducedMotion.bind({});
ToolkitParentChildLayoutReducedMotion.args = {
  stackedAtBreakpoint: "xl",
};

const useTabSelection = (initialValue?: number) => {
  const [selectedTab, setSelectedTab] = useState(initialValue ?? 0);
  const handleTabSelection = (tabIndex: number) => {
    setSelectedTab(tabIndex);
  };
  return [selectedTab, handleTabSelection] as const;
};

const tabs = ["Sint", "Dolor", "Magna"];

const stackedAtBreakpoint = "xs";

const Dashboard: ComponentStory<typeof ParentChildLayout> = (args) => {
  const [selectedTab, handleTabSelection] = useTabSelection();

  const [currentView, setCurrentView] = useState<StackedViewElement>("parent");

  const isStacked = useIsViewportLargerThanBreakpoint(stackedAtBreakpoint);

  const handleParent = () => {
    setCurrentView("parent");
  };
  const handleChild = () => {
    setCurrentView("child");
  };

  const parent = (
    <Tabstrip
      onActiveChange={handleTabSelection}
      orientation="vertical"
      onClick={() => {
        if (isStacked) {
          handleChild();
        }
      }}
      activeTabIndex={selectedTab}
      style={{ width: "100%", minWidth: 300 }}
    >
      {tabs.map((label, index) => (
        <Tab label={label} key={index} />
      ))}
    </Tabstrip>
  );

  const TitleWithBackButton = ({ text }: { text: string }) => (
    <FlowLayout
      align="center"
      justify="space-between"
      className="parent-child-composite-title"
    >
      <Button onClick={handleParent} variant="secondary" aria-label="Back">
        <ChevronLeftIcon size={12} />
      </Button>
      <h2>{text}</h2>
      <div className="parent-child-composite-empty-container"></div>
    </FlowLayout>
  );

  const Title = ({ text }: { text: string }) => (
    <FlowLayout align="center" className="parent-child-composite-title">
      <h2>{text}</h2>
    </FlowLayout>
  );

  const ChildTitle = () =>
    isStacked ? (
      <TitleWithBackButton text={tabs[selectedTab]} />
    ) : (
      <Title text={tabs[selectedTab]} />
    );

  const child = (
    <>
      {selectedTab === 0 && (
        <>
          <ChildTitle />
          <DashboardExample />
        </>
      )}
      {selectedTab === 1 && (
        <>
          <ChildTitle />
          <SectionForm />
        </>
      )}
      {selectedTab === 2 && (
        <>
          <ChildTitle />
          <Blog />
        </>
      )}
    </>
  );

  return (
    <div className="parent-child-composite-container">
      <ParentChildLayout
        {...args}
        stackedViewElement={currentView}
        parent={parent}
        child={child}
      />
    </div>
  );
};

export const ParentChildLayoutComposite = Dashboard.bind({});
ParentChildLayoutComposite.args = {
  stackedAtBreakpoint,
};
