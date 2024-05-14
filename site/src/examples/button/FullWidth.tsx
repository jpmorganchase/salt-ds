import { ReactElement } from "react";
import { Button } from "@salt-ds/core";
import { SendIcon } from "@salt-ds/icons";

export const FullWidth = (): ReactElement => (
  <div
    style={{
      width: "400px",
      display: "flex",
      gap: "8px",
      flexDirection: "column",
    }}
  >
    <Button variant="primary" style={{ width: "100%" }}>
      Primary FullWidth Button
    </Button>
    <Button variant="secondary" style={{ width: "100%" }}>
      Secondary FullWidth Button
    </Button>
    <Button variant="cta" style={{ width: "100%" }}>
      Send <SendIcon aria-hidden />
    </Button>
  </div>
);
