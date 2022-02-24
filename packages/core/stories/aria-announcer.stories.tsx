import { ChangeEvent, useCallback, useState, CSSProperties } from "react";
import { AriaAnnouncerProvider, useAriaAnnouncer } from "@brandname/core";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Core/AriaAnnouncerProvider",
  component: AriaAnnouncerProvider,
  // Manually specify onClick action to test Actions panel
  // react-docgen-typescript-loader doesn't support detecting interface extension
  // https://github.com/strothj/react-docgen-typescript-loader/issues/47
  argTypes: { onClick: { action: "clicked" } },
} as ComponentMeta<typeof AriaAnnouncerProvider>;

type changeEvt = ChangeEvent<HTMLInputElement>;
type interval = "delay" | "debounce";
/**
 * Do not apply visible style in a production app. This is for debug purposes only.
 */
const visibleStyle: CSSProperties = {
  clip: "auto",
  clipPath: "none",
  height: "auto",

  width: "auto",
  margin: 0,
  overflow: "visible",
  padding: 0,
  position: "relative",
};

const Content = () => {
  const [count, setCount] = useState(0);
  const [delay, setDelay] = useState("");
  const [debounce, setDebounce] = useState("");

  const getMilliseconds = useCallback(
    (type: interval) => {
      const value = type === "delay" ? delay : debounce;
      const maybeNumber = parseInt(value, 10);
      return isNaN(maybeNumber) ? undefined : maybeNumber;
    },
    [debounce, delay]
  );

  const { announce } = useAriaAnnouncer({
    debounce: getMilliseconds("debounce"),
  });

  const handleClick = useCallback(() => {
    setCount((currentValue) => {
      const newValue = currentValue + 1;
      announce(`count = ${newValue}`, getMilliseconds("delay"));
      return newValue;
    });
  }, [announce, getMilliseconds]);

  const handleDelay = (e: changeEvt) => {
    setDelay(e.target.value);
    setDebounce("");
  };
  const handleDebounce = (e: changeEvt) => {
    setDebounce(e.target.value);
    setDelay("");
  };

  const getButtonLabel = () => {
    if (delay) {
      return `Increment count with ${delay}ms delay`;
    } else if (debounce) {
      return `Increment count with ${debounce}ms debounce`;
    } else {
      return "Increment count, nothing fancy";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex" }}>
        <label htmlFor="txt-delay" style={{ width: 160 }}>
          Delay (ms):{" "}
        </label>
        <input
          id="txt-delay"
          onChange={handleDelay}
          style={{ width: 80 }}
          value={delay}
        />
      </div>
      <div style={{ display: "flex" }}>
        <label htmlFor="txt-debounce" style={{ width: 160 }}>
          Debounce Interval (ms):{" "}
        </label>
        <input
          id="txt-debounce"
          onChange={handleDebounce}
          style={{ width: 80 }}
          value={debounce}
        />
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={handleClick}>{getButtonLabel()}</button>
        <span>{count}</span>
      </div>
    </div>
  );
};

export const AriaAnnounceDebounceAndDelay: ComponentStory<
  typeof AriaAnnouncerProvider
> = () => (
  <AriaAnnouncerProvider style={visibleStyle}>
    <Content />
  </AriaAnnouncerProvider>
);
