import { useMemo, useState, useEffect } from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Card } from "@jpmorganchase/uitk-core";
import { DeckLayout, Tabstrip } from "@jpmorganchase/uitk-lab";

import "./styles.css";

export default {
  title: "Lab/Layout/DeckLayout",
  component: DeckLayout,
  argTypes: {
    activeIndex: {
      control: { type: "number", min: 0, max: 5, defaultValue: 0 },
    },
  },
} as ComponentMeta<typeof DeckLayout>;

const deckCards = (slides: number) =>
  Array.from({ length: slides }, (_, index) => (
    <Card key={index}>
      <h2>{`Deck Item ${index + 1}`}</h2>
      <p>
        We can implement your cross-border liquidity model in just a few months,
        depending on the options, scope and complexity.
      </p>
    </Card>
  ));

const DefaultDeckLayoutStory: ComponentStory<typeof DeckLayout> = (args) => {
  const slides = 6;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    args.activeIndex && setCurrentIndex(args.activeIndex);
  }, [args.activeIndex]);

  const handleIncrease = () => {
    if (currentIndex < slides - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  const handleDecrease = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  return (
    <>
      <button onClick={handleDecrease}>Previous</button>
      <button onClick={handleIncrease}>Next</button>
      <DeckLayout {...args} activeIndex={currentIndex}>
        {deckCards(slides)}
      </DeckLayout>
    </>
  );
};
export const DefaultDeckLayout = DefaultDeckLayoutStory.bind({});
DefaultDeckLayout.args = {};

const useTabSelection = (initialValue?: any) => {
  const [selectedTab, setSelectedTab] = useState(initialValue ?? 0);
  const handleTabSelection = (tabIndex: number) => {
    setSelectedTab(tabIndex);
  };
  return [selectedTab, handleTabSelection];
};

const WithTabStrip: ComponentStory<typeof DeckLayout> = (args) => {
  const [selectedTab, handleTabSelection] = useTabSelection();

  const tabs = [
    "Home",
    "Transactions",
    "FX",
    "Security Center",
    "Blog",
    "Settings",
  ];
  return (
    <div>
      <Tabstrip onChange={handleTabSelection} defaultTabs={tabs} />
      <DeckLayout activeIndex={selectedTab} {...args}>
        {tabs.map((tab, index) => {
          return (
            <Card key={index}>
              <h2>{`Tab ${index + 1}`}</h2>
              <p>
                We can implement your cross-border liquidity model in just a few
                months, depending on the options, scope and complexity.
              </p>
            </Card>
          );
        })}
      </DeckLayout>
    </div>
  );
};
export const DeckInTabstrip = WithTabStrip.bind({});
DeckInTabstrip.args = {};
