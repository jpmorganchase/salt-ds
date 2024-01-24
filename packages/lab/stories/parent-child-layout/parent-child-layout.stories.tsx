import { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";

import { ChevronLeftIcon, ThumbsUpIcon } from "@salt-ds/icons";
import {
  Tab,
  Tabstrip,
  ParentChildLayout,
  StackedViewElement,
  useIsViewportLargerThanBreakpoint,
} from "@salt-ds/lab";
import {
  Button,
  FlexItem,
  FlexLayout,
  FlowLayout,
  StackLayout,
} from "@salt-ds/core";

import "../layout/layout.stories.css";

export default {
  title: "Lab/Layout/Parent Child Layout",
  component: ParentChildLayout,
  argTypes: {
    stackedAtBreakpoint: {
      control: { type: "select" },
    },
  },
} as Meta<typeof ParentChildLayout>;

const parent = (
  <div className="layout-content" style={{ height: 500, minWidth: 150 }}>
    Parent
  </div>
);

const child = (
  <div className="layout-active-content" style={{ height: 500 }}>
    Child
  </div>
);

export const Default: StoryFn<typeof ParentChildLayout> = (args) => (
  <ParentChildLayout
    {...args}
    style={{ width: "90vw", maxWidth: 800, height: 500 }}
  />
);
Default.args = { parent, child };

export const Stacked: StoryFn<typeof ParentChildLayout> = (args) => {
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
        <ParentChildLayout {...args} stackedViewElement={currentView} />
      </div>
    </>
  );
};

Stacked.args = {
  stackedAtBreakpoint: "xl",
  parent,
  child,
};

export const ReducedMotion: StoryFn<typeof ParentChildLayout> = (args) => {
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
        />
      </div>
    </>
  );
};

ReducedMotion.args = {
  stackedAtBreakpoint: "xl",
  parent,
  child,
};

const useTabSelection = (initialValue?: number) => {
  const [selectedTab, setSelectedTab] = useState(initialValue ?? 0);
  const handleTabSelection = (tabIndex: number) => {
    setSelectedTab(tabIndex);
  };
  return [selectedTab, handleTabSelection] as const;
};

const tabs = ["Sint", "Dolor", "Magna"];

export const Composite: StoryFn<typeof ParentChildLayout> = (args) => {
  const [selectedTab, handleTabSelection] = useTabSelection();

  const [currentView, setCurrentView] = useState<StackedViewElement>("parent");

  const isStacked = useIsViewportLargerThanBreakpoint("xs");

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
        <ChevronLeftIcon />
      </Button>
      <h2>{text}</h2>
      <div className="parent-child-composite-empty-container" />
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

  const renderArticleButtons = (
    <FlowLayout gap={1}>
      <Button>Save to reading list</Button>
      <Button>Share</Button>
      <Button aria-label="like">
        <ThumbsUpIcon />
      </Button>
    </FlowLayout>
  );

  const child = (
    <>
      <ChildTitle />
      <StackLayout>
        <FlexLayout wrap={{ xs: true, lg: false }}>
          <FlexItem grow={1} className="flex-blog-image flex-blog-image-one" />
          <StackLayout>
            <h3>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            </h3>
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem
              accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
              quae ab illo inventore veritatis et quasi architecto beatae vitae
              dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
              aspernatur aut odit aut fugit, sed quia consequuntur magni dolores
              eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam
              est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci
              velit, sed quia non numquam eius modi tempora incidunt ut labore
              et dolore magnam aliquam quaerat voluptatem.
            </p>
            {renderArticleButtons}
          </StackLayout>
        </FlexLayout>

        <FlexLayout wrap={{ xs: true, lg: false }}>
          <FlexItem grow={1} className="flex-blog-image flex-blog-image-two" />
          <StackLayout>
            <h3>Nemo enim ipsam voluptatem quia voluptas sit aspernatur</h3>
            <p>
              At vero eos et accusamus et iusto odio dignissimos ducimus qui
              blanditiis praesentium voluptatum deleniti atque corrupti quos
              dolores et quas molestias excepturi sint occaecati cupiditate non
              provident, similique sunt in culpa qui officia deserunt mollitia
              animi.
            </p>
            {renderArticleButtons}
          </StackLayout>
        </FlexLayout>

        <FlexLayout wrap={{ xs: true, lg: false }}>
          <FlexItem
            grow={1}
            className="flex-blog-image flex-blog-image-three"
          />
          <StackLayout>
            <h3>At vero eos et accusamus et iusto odio dignissimos ducimus</h3>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum. Duis aute irure dolor in reprehenderit in
              voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
              officia deserunt mollit anim id est laborum.
            </p>
            {renderArticleButtons}
          </StackLayout>
        </FlexLayout>
      </StackLayout>
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
