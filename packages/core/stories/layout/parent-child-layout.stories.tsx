import { useState } from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import { DoubleChevronLeftIcon } from "@jpmorganchase/uitk-icons";
import { Tabstrip, Tab, Avatar } from "@jpmorganchase/uitk-lab";
import {
  Button,
  Card,
  GridLayout,
  GridItem,
  ParentChildLayout,
  StackedViewElement,
  useIsStacked,
} from "@jpmorganchase/uitk-core";

import "@jpmorganchase/uitk-core/stories/layout/styles.css";

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

const containerStyles = {
  border: "solid 1px lightgrey",
  padding: 16,
  minWidth: "60vw",
};

const stackedAtBreakpoint = "sm";

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

  const parent = (
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
  );

  const child = (
    <GridLayout rows={2} columns={5}>
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
  );

  return (
    <div style={containerStyles}>
      <ParentChildLayout
        {...args}
        stackedViewElement={currentView}
        parent={parent}
        child={child}
      />
    </div>
  );
};

export const ToolkitParentChildLayoutResponsive = Responsive.bind({});
ToolkitParentChildLayoutResponsive.args = {
  stackedAtBreakpoint,
};

// TODO: add new example for parent and child
// const Dashboard: ComponentStory<typeof ParentChildLayout> = (args) => {
//   const [selectedTab, handleTabSelection] = useTabSelection();

//   const [currentView, setCurrentView] = useState<StackedViewElement>("parent");

//   const isStacked = useIsStacked(stackedAtBreakpoint);

//   const handleParent = () => {
//     setCurrentView("parent");
//   };
//   const handleChild = () => {
//     setCurrentView("child");
//   };

//   const parent = (
//     <Tabstrip
//       onChange={handleTabSelection}
//       orientation="vertical"
//       onClick={() => {
//         if (isStacked) {
//           handleChild();
//         }
//       }}
//       value={selectedTab}
//       style={{ width: "100%", minWidth: 300 }}
//     >
//       {tabs.map((_, index) => (
//         <Tab label="Medium" key={index} />
//       ))}
//     </Tabstrip>
//   );

//   const backButton = isStacked && (
//     <Button variant="cta" onClick={handleParent}>
//       <DoubleChevronLeftIcon size={12} />
//       {` Return`}
//     </Button>
//   );

//   return (
//     <div style={containerStyles}>
//       <ParentChildLayout
//         {...args}
//         stackedViewElement={currentView}
//         parent={parent}
//         child={<GridLayoutComposite />}
//       />
//     </div>
//   );
// };

// export const ParentChildLayoutComposite = Dashboard.bind({});
// ParentChildLayoutComposite.args = {
//   stackedAtBreakpoint,
// };
