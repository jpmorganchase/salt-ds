import { AriaAnnouncerProvider, useAriaAnnouncer, useId } from "@salt-ds/core";
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

type Interval = "delay" | "debounce";
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
  const [debounce, setDebounce] = useState("");

  const getMilliseconds = (type: Interval) => {
    let value;
    if (type === "delay") {
      value = delay;
    } else {
      value = debounce;
    }
    const maybeNumber = Number.parseInt(value, 10);
    return Number.isNaN(maybeNumber) ? undefined : maybeNumber;
  };

  const { announce } = useAriaAnnouncer({
    debounce: getMilliseconds("debounce"),
  });

  const handleClick = (ariaLive: "assertive" | "polite") => {
    setCount((currentValue) => {
      const newValue = currentValue + 1;
      const delay = getMilliseconds("delay");
      announce(
        `count = ${newValue}`,
        delay !== undefined ? delay : { ariaLive },
      );
      return newValue;
    });
  };

  const handleAssertiveClick = () => {
    setCount((currentValue) => {
      const newValue = currentValue + 1;
      const delay = getMilliseconds("delay");
      announce(
        `count = ${newValue}`,
        delay !== undefined ? delay : { ariaLive: "assertive" },
      );
      return newValue;
    });
  };

  const handleDelay = (e: ChangeEvent<HTMLInputElement>) => {
    setDelay(e.target.value);
    setDebounce("");
  };

  const handleDebounce = (e: ChangeEvent<HTMLInputElement>) => {
    setDebounce(e.target.value);
    setDelay("");
  };

  const getButtonLabel = () => {
    if (delay) {
      return `Increment count with ${delay}ms delay ${getMilliseconds("debounce") !== undefined ? ` and debounce=${debounce}ms` : ""}`;
    }

    if (debounce) {
      return `Increment count with debounce=${debounce}ms only`;
    }
    return "Increment count, nothing fancy";
  };

  const delayInputId = useId();
  const debounceInputId = useId();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
      <span aria-hidden="true" style={{ display: "flex", width: 160 }}>
        Count: {count}
      </span>
      <button onClick={() => handleClick("assertive")}>
        Assertive - {getButtonLabel()}
      </button>
      <button onClick={() => handleClick("polite")}>
        Polite - {getButtonLabel()}
      </button>
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
