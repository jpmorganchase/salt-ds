import { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";

import { ChevronLeftIcon, ThumbsUpIcon } from "@salt-ds/icons";
import {
  ParentChildLayout,
  StackedViewElement
} from "@salt-ds/lab";
import {
  Button,
  FlexItem,
  FlexLayout,
  FlowLayout,
  NavigationItem,
  StackLayout,
} from "@salt-ds/core";

import "./parent-child-layout.stories.css";

export default {
  title: "Lab/Layout/Parent Child Layout",
  component: ParentChildLayout,
} as Meta<typeof ParentChildLayout>;

const parent = (
  <div className="parent-content" style={{ height: 500, minWidth: 150 }}>
    Parent
  </div>
);

const child = (
  <div className="child-content" style={{ height: 500 }}>
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

export const Collapsed: StoryFn<typeof ParentChildLayout> = (args) => {
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
        <ParentChildLayout {...args} collapsedViewElement={currentView} />
      </div>
    </>
  );
};

Collapsed.args = {
  collapseAtBreakpoint: "xl",
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
          collapsedViewElement={currentView}
        />
      </div>
    </>
  );
};

ReducedMotion.args = {
  collapseAtBreakpoint: "xl",
  parent,
  child,
};

export const Composite: StoryFn<typeof ParentChildLayout> = (args) => {
  const items = ["Sint", "Dolor", "Magna"];

  const [currentView, setCurrentView] = useState<StackedViewElement>("parent");

  const showParent = () => {
    setCurrentView("parent");
  };
  const showChild = () => {
    setCurrentView("child");
  };

  const [active, setActive] = useState(items[0]);

  const parent = (
    <nav>
      <ul className="vertical">
        {items.map((item) => (
          <li key={item}>
            <NavigationItem
              active={active === item}
              href="#"
              orientation="vertical"
              onClick={(event) => {
                // Prevent default to avoid navigation
                event.preventDefault();
                setActive(item);
                showChild();
              }}
            >
              {item}
            </NavigationItem>
          </li>
        ))}
      </ul>
    </nav>
  );

  const child = (
    <>
      {/* {isStacked && ( */}
      <Button onClick={showParent} variant="secondary" aria-label="Back">
        <ChevronLeftIcon />
      </Button>
      {/* )} */}
      <h2>{active}</h2>
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
            eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est,
            qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit,
            sed quia non numquam eius modi tempora incidunt ut labore et dolore
            magnam aliquam quaerat voluptatem.
          </p>
          <FlowLayout gap={1}>
            <Button>Save to reading list</Button>
            <Button>Share</Button>
            <Button aria-label="like">
              <ThumbsUpIcon />
            </Button>
          </FlowLayout>
        </StackLayout>
      </FlexLayout>
    </>
  );

  return (
    <div className="parent-child-composite-container">
      <ParentChildLayout
        {...args}
        collapsedViewElement={currentView}
        collapseAtBreakpoint="xs"
        parent={parent}
        child={child}
      />
    </div>
  );
};
