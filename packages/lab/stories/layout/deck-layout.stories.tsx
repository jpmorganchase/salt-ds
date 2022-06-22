import {Card} from "@jpmorganchase/uitk-core";
import { Carousel, DeckLayout, Tabstrip } from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import React, { useState } from "react";

export default {
  title: "Lab/Layout/DeckLayout",
  component: DeckLayout,
  argTypes: {},
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
  const slides = 12;
  const [currentIndex, setCurrentIndex] = useState(10);

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

  const tabs = ["Home", "Transactions", "FX", "Security Center", "Blog"];
  return (
    <div>
      <Tabstrip onChange={handleTabSelection} defaultTabs={tabs} />
      <DeckLayout {...args} activeIndex={selectedTab}>
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
export const DeckInCarousel = WithCarousel.bind({});
DeckInCarousel.args = {};
