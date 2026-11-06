import { Progress } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Buffer = (): ReactElement => (
  <div style={{ width: 320 }}>
    <Progress label="Playing video" value={38} bufferValue={60} />
  </div>
);
