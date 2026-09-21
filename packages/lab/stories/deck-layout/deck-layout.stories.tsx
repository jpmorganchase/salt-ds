import { Card, H2, StackLayout, Text } from "@salt-ds/core";
import { DeckItem, DeckLayout, Tab, Tabstrip } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import "../layout/layout.stories.css";

export default {
  title: "Lab/Layout/Deck Layout",
  component: DeckLayout,
  argTypes: {
    activeIndex: {
      control: { type: "number", min: 0, max: 5, defaultValue: 0 },
    },
  },
  subcomponents: { DeckItem },
} as Meta<typeof DeckLayout>;

const deckCards = (slides: number) =>
  Array.from({ length: slides }, (_, index) => (
    <Card key={index}>
      <StackLayout gap={1}>
        <H2>{`Deck Item ${index + 1}`}</H2>
        <Text as="p">
          We can implement your cross-border liquidity model in just a few
          months, depending on the options, scope and complexity.
        </Text>
      </StackLayout>
    </Card>
  ));

const DefaultDeckLayoutStory: StoryFn<typeof DeckLayout> = (args) => {
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
      <DeckLayout
        {...args}
        activeIndex={currentIndex}
        deckItemProps={{
          "aria-roledescription": "slide",
        }}
      >
        {deckCards(slides)}
      </DeckLayout>
    </>
  );
};
export const Default = DefaultDeckLayoutStory.bind({});
Default.args = {};

const WithTabStrip: StoryFn<typeof DeckLayout> = (args) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

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
      <Tabstrip onActiveChange={setActiveTabIndex}>
        {tabs.map((label) => (
          <Tab label={label} key={label} />
        ))}
      </Tabstrip>
      <DeckLayout
        activeIndex={activeTabIndex}
        deckItemProps={{ role: "tabpanel" }}
        {...args}
      >
        {tabs.map((_tab, index) => {
          return (
            <Card key={index}>
              <StackLayout gap={1}>
                <H2>{`Tab ${index + 1}`}</H2>
                <Text as="p">
                  We can implement your cross-border liquidity model in just a
                  few months, depending on the options, scope and complexity.
                </Text>
              </StackLayout>
            </Card>
          );
        })}
      </DeckLayout>
    </div>
  );
};
export const DeckInTabstrip = WithTabStrip.bind({});
DeckInTabstrip.args = {};
