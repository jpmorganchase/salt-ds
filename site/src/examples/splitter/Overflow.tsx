import {
  Button,
  FlexLayout,
  SplitHandle,
  SplitPanel,
  Splitter,
  StackLayout,
} from "@salt-ds/core";
import { useState } from "react";
import styles from "./splitter.module.css";

export function Overflow() {
  const [allowOverflow, setAllowOverflow] = useState(false);

  function handleEnableOverflow() {
    setAllowOverflow(!allowOverflow);
  }

  function SampleContent({ rows = 12 }) {
    const quote =
      '"Simplicity is the ultimate sophistication." - Leonardo da Vinci';
    const grid = Array.from({ length: rows }, () => quote);

    return (
      <>
        {grid.map((line, index) => (
          <div key={index} style={{ whiteSpace: "nowrap" }}>
            {`Line ${index + 1} of ${rows}: ${line}`}
          </div>
        ))}
      </>
    );
  }

  const overflowProps = allowOverflow ? { overflow: "auto" } : {};

  return (
    <StackLayout direction={"column"}>
      <FlexLayout className={styles.box} style={{ width: "600px"}}>
        <Splitter className="box" orientation="vertical">
          <SplitPanel>
            <Splitter orientation="horizontal">
              <SplitPanel className="center">
                <div
                  style={{ width: "100%", height: "100%", ...overflowProps }}
                >
                  <SampleContent />
                </div>
              </SplitPanel>
              <SplitHandle />
              <SplitPanel className="center">
                <div
                  style={{ width: "100%", height: "100%", ...overflowProps }}
                >
                  <SampleContent />
                </div>
              </SplitPanel>
              <SplitHandle />
              <SplitPanel className="center">
                <div
                  style={{ width: "100%", height: "100%", ...overflowProps }}
                >
                  <SampleContent />
                </div>
              </SplitPanel>
            </Splitter>
          </SplitPanel>
          <SplitHandle />
          <SplitPanel>
            <Splitter orientation="horizontal">
              <SplitPanel className="center">
                <div
                  style={{ width: "100%", height: "100%", ...overflowProps }}
                >
                  <SampleContent />
                </div>
              </SplitPanel>
              <SplitHandle />
              <SplitPanel className="center">
                <div
                  style={{ width: "100%", height: "100%", ...overflowProps }}
                >
                  <SampleContent />
                </div>
              </SplitPanel>
            </Splitter>
          </SplitPanel>
        </Splitter>
      </FlexLayout>
      <Button
        onClick={handleEnableOverflow}
        aria-label="toggle enable overflow"
      >
        {allowOverflow ? "Disable overflow (Default)" : "Enable overflow"}
      </Button>
    </StackLayout>
  );
}
