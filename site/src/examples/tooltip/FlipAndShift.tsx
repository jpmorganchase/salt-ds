import { ReactElement, useCallback } from "react";
import { Button, Tooltip } from "@salt-ds/core";

export const FlipAndShift = (): ReactElement => {
  const handleScrollButton = useCallback((node: HTMLButtonElement | null) => {
    node?.scrollIntoView({ block: "center", inline: "center" });
  }, []);

  return (
    <div
      style={{
        display: "block",
        maxWidth: "500px",
        maxHeight: "400px",
        overflow: "auto",
        flex: 1,
      }}
    >
      <div
        style={{
          height: "800px",
          width: "1100px",
        }}
      >
        <Tooltip status="info" content="I am a tooltip" placement="top" open>
          <Button
            style={{ marginTop: "400px", marginLeft: "500px" }}
            ref={handleScrollButton}
          >
            Hover
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};
