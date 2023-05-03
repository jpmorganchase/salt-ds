import { SyntheticEvent, useRef } from "react";
import { ComponentMeta } from "@storybook/react";
import { Link, StackLayout, ValidationStatus } from "@salt-ds/core";
import {
  Banner,
  BannerCloseButton,
  BannerContent,
  BannerProps,
} from "@salt-ds/lab";

import "./banner.ada.css";
import { useState } from "@storybook/addons";

export default {
  title: "Lab/Banner/ADA",
  component: Banner,
} as ComponentMeta<typeof Banner>;

export const Form = () => {
  const [invalid, setInvalid] = useState(false);
  const name = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: SyntheticEvent) => {
    console.log("name.current", `1${name.current?.value}2`);
    if (name.current?.value && name.current?.value.length > 0) {
      setInvalid(false);
    } else {
      setInvalid(true);
    }
    event.preventDefault();
  };

  return (
    <div style={{ width: "60vw" }}>
      <Banner open={invalid} status="error">
        <BannerContent>The form is not valid</BannerContent>
        <BannerCloseButton />
      </Banner>

      <form action="" onSubmit={handleSubmit}>
        <fieldset>
          <label>
            <div>Name:</div>
            <input ref={name} type="text" name="name" />
          </label>
        </fieldset>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};

export const Text = () => {
  return (
    <>
      <h1>Use italics sparingly</h1>
      <Banner>
        <BannerContent>
          Our guidance for italics usage differs from that of the “AP
          Stylebook.”
        </BannerContent>
      </Banner>
      In most instances, use italics for emphasis only—to highlight a specific
      word or phrase. For publication names, the introduction of new terms,
      etc., use quotation marks instead. If you’re writing technical content,
      however, italics are more widely used. Refer to our Technical
      documentation guide for more details.
    </>
  );
};
