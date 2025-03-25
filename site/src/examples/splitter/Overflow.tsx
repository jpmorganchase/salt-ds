import {
  Button,
  FlexLayout,
  SplitHandle,
  SplitPanel,
  Splitter,
  StackLayout,
  Text,
} from "@salt-ds/core";
import clsx from "clsx";

import { useState } from "react";
import styles from "./splitter.module.css";

const nameToQuote = new Map([
  ["Leonardo", "Simplicity is the ultimate sophistication."],
  ["Albert", "Imagination is more important than knowledge."],
  ["Isaac", "Nature and nature's laws lay hid in night."],
  ["Marie", "Nothing in life is to be feared, it is only to be understood."],
  ["Ada", "That brain of mine is something more than merely mortal."],
  ["Roosevelt", "The only thing we have to fear is fear itself"],
  ["Churchill", "Success is not final, failure is not fatal."],
  ["Gandhi", "Be the change that you wish to see in the world."],
  ["Mandela", "It always seems impossible until it's done."],
  ["King", "The time is always right to do what is right."],
  ["Jobs", "Stay hungry, stay foolish."],
  ["Lennon", "Life is what happens when you're busy making other plans."],
  ["Twain", "The secret of getting ahead is getting started."],
]);

function Quotes() {
  return (
    <>
      {[...nameToQuote].map(([name, quote], index) => (
        <Text key={name} style={{ whiteSpace: "nowrap" }}>
          {`Quote ${index + 1} of ${nameToQuote.size}: ${quote}`}
        </Text>
      ))}
    </>
  );
}

export function Overflow() {
  const [enableScroll, setEnableScroll] = useState(false);

  function toggleScroll() {
    setEnableScroll(!enableScroll);
  }

  return (
    <StackLayout direction="column">
      <FlexLayout className={styles.box}>
        <Splitter orientation="vertical">
          <SplitPanel>
            <FlexLayout
              gap={1}
              padding={1}
              direction="column"
              className={clsx(styles.h100, enableScroll && styles.scroll)}
            >
              <Quotes />
            </FlexLayout>
          </SplitPanel>
          <SplitHandle />
          <SplitPanel>
            <FlexLayout
              gap={1}
              padding={1}
              direction="column"
              className={clsx(styles.h100, enableScroll && styles.scroll)}
            >
              <Quotes />
            </FlexLayout>
          </SplitPanel>
        </Splitter>
      </FlexLayout>
      <Button onClick={toggleScroll}>
        {enableScroll ? "Disable Scroll" : "Enable Scroll"}
      </Button>
    </StackLayout>
  );
}
