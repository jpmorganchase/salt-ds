import {
  Checkbox,
  CheckboxGroup,
  FlexItem,
  FlexLayout,
  StackLayout,
} from "@salt-ds/core";
import { clsx } from "clsx";
import { type ReactElement, useState } from "react";
import styles from "./Spacing.module.css";

export const Spacing = (): ReactElement => {
  const [showGap, setShowGap] = useState(true);
  const [showMargin, setShowMargin] = useState(false);
  const [showPadding, setShowPadding] = useState(false);

  const gap = showGap ? 3 : 0;
  const margin = showMargin ? 3 : 0;
  const padding = showPadding ? 3 : 0;
  return (
    <StackLayout align={"center"}>
      <CheckboxGroup
        direction="horizontal"
        name="Spacing"
        defaultCheckedValues={["gap, margin, padding"]}
      >
        <Checkbox
          label="Gap"
          checked={showGap}
          onChange={() => setShowGap(!showGap)}
        />
        <Checkbox
          label="Padding"
          checked={showPadding}
          onChange={() => setShowPadding(!showPadding)}
        />
        <Checkbox
          label="Margin"
          checked={showMargin}
          onChange={() => setShowMargin(!showMargin)}
        />
      </CheckboxGroup>
      <div
        className={clsx({
          [styles.spacingExampleMargin]: showMargin,
        })}
      >
        <FlexLayout
          className={clsx({
            [styles.spacingExamplePadding]: showPadding,
          })}
          gap={gap}
          padding={padding}
          margin={margin}
        >
          {Array.from({ length: 5 }, (_, index) => (
            <FlexItem
              className={clsx(
                {
                  [styles.spacingExampleGap]: showGap,
                },
                styles.item,
              )}
              key={`item-${index + 1}`}
              padding={1}
            >
              <p>Item {index + 1}</p>
            </FlexItem>
          ))}
        </FlexLayout>
      </div>
    </StackLayout>
  );
};
