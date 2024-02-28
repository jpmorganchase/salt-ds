import { ReactElement } from "react";

import { Overlay, OverlayPanel, OverlayTrigger } from "@salt-ds/lab";
import { Button, StackLayout } from "@salt-ds/core";

export const LongContent = (): ReactElement => {
  return (
    <Overlay placement="right">
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel
        style={{
          width: 300,
          height: 200,
          overflow: "auto",
        }}
      >
        <StackLayout>
          <div>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industrys standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book.
          </div>
          <div>
            It has survived not only five centuries, but also the leap into
            electronic typesetting, remaining essentially unchanged. It was
            popularised in the 1960s with the release of Letraset sheets
            containing Lorem Ipsum passages, and more recently with desktop
            publishing software like Aldus PageMaker including versions of Lorem
            Ipsum.
          </div>
        </StackLayout>
      </OverlayPanel>
    </Overlay>
  );
};
