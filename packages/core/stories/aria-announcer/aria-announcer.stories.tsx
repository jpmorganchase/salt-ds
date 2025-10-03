import {
  AriaAnnouncerProvider,
  RadioButton,
  RadioButtonGroup,
  useAriaAnnouncer,
  useId,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { type ChangeEvent, type CSSProperties, useState } from "react";

export default {
  title: "Core/Aria Announcer Provider",
  component: AriaAnnouncerProvider,
  // Manually specify onClick action to test Actions panel
  // react-docgen-typescript-loader doesn't support detecting interface extension
  // https://github.com/strothj/react-docgen-typescript-loader/issues/47
  argTypes: { onClick: { action: "clicked" } },
} as Meta<typeof AriaAnnouncerProvider>;

type Interval = "delay" | "debounce" | "duration";
type AriaLive = "assertive" | "polite" | undefined;
/**
 * Do not apply visible style in a production app. This is for debug purposes only.
 */
const visibleStyle: CSSProperties = {
  display: "block",
  clip: "auto",
  clipPath: "none",
  height: "auto",
  width: "auto",
  margin: 0,
  overflow: "visible",
  padding: 0,
  position: "absolute",
};

const Content = () => {
  const [count, setCount] = useState(0);
  const [delay, setDelay] = useState("");
  const [ariaLive, setAriaLive] = useState<AriaLive>("assertive");
  const [debounce, setDebounce] = useState("");
  const [duration, setDuration] = useState("");

  const getMilliseconds = (type: Interval) => {
    let value;
    if (type === "delay") {
      value = delay;
    } else if (type === "debounce") {
      value = debounce;
    } else {
      value = duration;
    }
    const maybeNumber = Number.parseInt(value, 10);
    return Number.isNaN(maybeNumber) ? undefined : maybeNumber;
  };

  const { announce } = useAriaAnnouncer({
    debounce: getMilliseconds("debounce"),
  });

  const handleClick = () => {
    setCount((currentValue) => {
      const newValue = currentValue + 1;
      const delay = getMilliseconds("delay");
      const duration = getMilliseconds("duration");
      announce(
        `count = ${newValue}`,
        delay !== undefined ? delay : { ariaLive, duration },
      );
      return newValue;
    });
  };

  const handleDelay = (e: ChangeEvent<HTMLInputElement>) => {
    setDelay(e.target.value);
    setDebounce("");
    setDuration("");
  };

  const handleDebounce = (e: ChangeEvent<HTMLInputElement>) => {
    setDebounce(e.target.value);
    setDelay("");
    setDuration("");
  };

  const handleDuration = (e: ChangeEvent<HTMLInputElement>) => {
    setDuration(e.target.value);
    setDelay("");
    setDebounce("");
  };

  const handleAriaLive = (e: ChangeEvent<HTMLInputElement>) => {
    setAriaLive(e.target.value as AriaLive);
  };

  const getButtonLabel = () => {
    if (delay) {
      return `Increment count with ${delay}ms delay ${getMilliseconds("debounce") !== undefined ? ` and debounce=${debounce}ms` : ""}`;
    }
    if (duration) {
      return `Increment count with ${duration}ms duration ${getMilliseconds("debounce") !== undefined ? ` and debounce=${debounce}ms` : ""}`;
    }
    if (debounce) {
      return `Increment count with debounce=${debounce}ms only`;
    }
    return "Increment count, nothing fancy";
  };

  const delayInputId = useId();
  const debounceInputId = useId();
  const durationInputId = useId();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <RadioButtonGroup
        name="ariaLive"
        direction="horizontal"
        onChange={handleAriaLive}
        value={ariaLive}
      >
        <RadioButton label="Assertive" value="assertive" />
        <RadioButton label="Polite" value="polite" />
      </RadioButtonGroup>
      <div style={{ display: "flex" }}>
        <label htmlFor={delayInputId} style={{ width: 160 }}>
          Delay (ms):{" "}
        </label>
        <input
          id={delayInputId}
          onChange={handleDelay}
          style={{ width: 80 }}
          value={delay}
        />
      </div>
      <div style={{ display: "flex" }}>
        <label htmlFor={debounceInputId} style={{ width: 160 }}>
          Debounce Interval (ms):{" "}
        </label>
        <input
          id={debounceInputId}
          onChange={handleDebounce}
          style={{ width: 80 }}
          value={debounce}
        />
      </div>
      <div style={{ display: "flex" }}>
        <label htmlFor={durationInputId} style={{ width: 160 }}>
          Duration (ms):{" "}
        </label>
        <input
          id={durationInputId}
          onChange={handleDuration}
          style={{ width: 80 }}
          value={duration}
        />
      </div>
      <span aria-hidden="true" style={{ display: "flex", width: 160 }}>
        Count: {count}
      </span>
      <button onClick={handleClick}>{getButtonLabel()}</button>
    </div>
  );
};

export const AriaAnnounceDebounceAndDelay: StoryFn<
  typeof AriaAnnouncerProvider
> = () => (
  <AriaAnnouncerProvider style={visibleStyle}>
    <Content />
  </AriaAnnouncerProvider>
);
