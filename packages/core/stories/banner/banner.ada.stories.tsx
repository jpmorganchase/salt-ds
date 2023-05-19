import { ComponentMeta } from "@storybook/react";
import {
  Banner,
  BannerCloseButton,
  BannerContent,
  Button,
} from "@salt-ds/core";

import { useState } from "@storybook/addons";

export default {
  title: "Core/Banner/ADA",
  component: Banner,
} as ComponentMeta<typeof Banner>;

export const Controlled = () => {
  const [open, setOpen] = useState(true);

  const onClose = () => {
    setOpen(false);
  };

  const toggleButton = () => {
    setOpen(!open);
  };

  return (
    <div style={{ width: "50vw" }}>
      {open && (
        <Banner aria-live="assertive">
          <BannerContent>Controlled banner</BannerContent>
          <BannerCloseButton onClick={onClose} />
        </Banner>
      )}
      <Button onClick={toggleButton}>toggle banner</Button>
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
