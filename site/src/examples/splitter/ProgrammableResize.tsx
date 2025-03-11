import {
  Button,
  FlexLayout,
  type ImperativePanelHandle,
  SplitHandle,
  SplitPanel,
  Splitter,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { useRef } from "react";

import styles from "./splitter.module.css";

export function ProgrammableResize() {
  const ref = useRef<ImperativePanelHandle>(null);

  function handleResizeLeft(size: number) {
    return () => {
      ref.current?.resize(size);
    };
  }

  return (
    <FlexLayout align="center">
      <StackLayout gap={2}>
        <Button onClick={handleResizeLeft(10)}>10 | 90</Button>
        <Button onClick={handleResizeLeft(25)}>25 | 75</Button>
        <Button onClick={handleResizeLeft(50)}>50 | 50</Button>
        <Button onClick={handleResizeLeft(75)}>75 | 25</Button>
        <Button onClick={handleResizeLeft(90)}>90 | 10</Button>
      </StackLayout>
      <StackLayout>
        <FlexLayout className={styles.box}>
          <Splitter orientation="vertical" appearance="bordered">
            <SplitPanel ref={ref} className={styles.center}>
              <Text>Left</Text>
            </SplitPanel>
            <SplitHandle />
            <SplitPanel className={styles.center}>
              <Text>Right</Text>
            </SplitPanel>
          </Splitter>
        </FlexLayout>
      </StackLayout>
    </FlexLayout>
  );
}
