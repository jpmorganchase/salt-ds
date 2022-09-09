import { Banner } from "@jpmorganchase/uitk-lab";

import { ComponentMeta, ComponentStory } from "@storybook/react";
import { useState } from "react";

export default {
  title: "Lab/Banner",
  component: Banner,
} as ComponentMeta<typeof Banner>;

export const Default: ComponentStory<typeof Banner> = () => {
  const [showBanner, setShowBanner] = useState(true);

  const handleClose = () => {
    setShowBanner(false);
  };

  return (
    <div style={{ width: "95%", minWidth: "60vw" }}>
      {showBanner && (
        <Banner
          //eslint-disable-next-line no-script-url
          LinkProps={{ href: "javascript:void(0)" }}
          onClose={handleClose}
          state="success"
        >
          Clear Transact.
        </Banner>
      )}
    </div>
  );
};
